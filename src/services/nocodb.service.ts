import axios from 'axios';

export class NocoDBService {
  private baseURL: string;
  private tableId: string;

  constructor(tableId: string) {
    this.baseURL = import.meta.env.VITE_APP_NOCODB_URL;
    this.tableId = tableId;
  }

  private getHeaders() {
    return {
      'xc-token': import.meta.env.VITE_APP_NOCODB_TOKEN,
      'Content-Type': 'application/json'
    };
  }

  list(params?: {
    where?: string;
    offset?: number;
    limit?: number;
    viewId?: string;
  }): Promise<Record<string, unknown>[]> {
    return axios.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records`, {
      headers: this.getHeaders(),
      params: {
        ...params,
      }
    })
    .then(response => response.data)
    .catch(error => {
      console.error(error);
      return [];
    })
  }

  async create(data: Record<string, unknown>[]) {
    const response = await axios.post(`${this.baseURL}/api/v2/tables/${this.tableId}/records`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async update(data: Array<{ Id: string } & Record<string, unknown>>) {
    const updatePromises = data.map(item =>
      axios.patch(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${item.Id}`, item, {
        headers: this.getHeaders()
      })
    );
    return Promise.all(updatePromises);
  }

  async delete(ids: Array<{ Id: string }>) {
    const deletePromises = ids.map(item =>
      axios.delete(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${item.Id}`, {
        headers: this.getHeaders()
      })
    );
    return Promise.all(deletePromises);
  }

  async read(recordId: number, params?: { fields?: string[] }) {
    const response = await axios.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${recordId}`, {
      headers: this.getHeaders(),
      params: {
        fields: params?.fields?.join(',')
      }
    });
    return response.data;
  }

  async count(params?: { where?: string }) {
    const response = await axios.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records/count`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }
}

export default NocoDBService;
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_APP_NOCODB_URL}`;
const API_TOKEN = `${import.meta.env.VITE_APP_NOCODB_TOKEN}`;

const nocoClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'xc-token': API_TOKEN
  }
});

export const fetchTable = async (tableName: string, params = {}) => {
  try {
    const response = await nocoClient.get(`/api/v1/db/data/noco/${tableName}`, { params });
    return response.data.list;
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    throw error;
  }
};

export const createRecord = async (tableName: string, data: any) => {
  try {
    const response = await nocoClient.post(`/api/v1/db/data/noco/${tableName}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating record in ${tableName}:`, error);
    throw error;
  }
};

export default nocoClient;
