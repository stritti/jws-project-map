import axios from 'axios';

export class NocoDBService {
  private baseURL: string;
  private tableId: string;
  private cache: Map<string, any> = new Map();

  constructor(tableId: string) {
    this.baseURL = import.meta.env.VITE_APP_NOCODB_URL;
    this.tableId = tableId;
  }

  private getCacheKey(method: string, params?: any): string {
    return JSON.stringify({ method, params });
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
    sort?: string;
    populate?: string;
  }): Promise<Record<string, unknown>[]> {
    const cacheKey = this.getCacheKey('list', params);
    
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return Promise.resolve(cachedData);
    }

    return axios.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records`, {
      headers: this.getHeaders(),
      params: {
        ...params,
      }
    })
    .then(response => {
      this.cache.set(cacheKey, response.data);
      return response.data;
    })
    .catch(error => {
      console.error(error);
      return [];
    });
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

  async nested(recordId: number, params?: { nestedField?: string }) {
    const response = await axios.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${recordId}/nested`, {
      headers: this.getHeaders(),
      params: {
        nestedField: params?.nestedField
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
