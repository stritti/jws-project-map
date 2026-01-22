import axios from 'axios';

// Create axios instance with timeout for faster failure
const axiosInstance = axios.create({
  timeout: 10000, // 10 second timeout
});

export class NocoDBService {
  private baseURL: string;
  private tableId: string;
  private cache: Map<string, { data: Record<string, unknown>; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<Record<string, unknown>>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

  private getCacheKey(params?: Record<string, unknown>): string {
    return `${this.tableId}:${JSON.stringify(params || {})}`;
  }

  private getFromCache(key: string): Record<string, unknown> | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  list(params?: {
    where?: string;
    offset?: number;
    limit?: number;
    viewId?: string;
    sort?: string;
    populate?: string;
    fields?: string[];
  }): Promise<Record<string, unknown>> {
    const cacheKey = this.getCacheKey(params);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }

    // Check if there's already a pending request
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    // Make new request with timeout
    const request = axiosInstance.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records`, {
      headers: this.getHeaders(),
      params: {
        ...params,
      }
    })
    .then(response => {
      // Return the full response data structure (which should have .list property)
      const data = response.data;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      this.pendingRequests.delete(cacheKey);
      return data;
    })
    .catch(error => {
      console.error('NocoDB request failed:', error.message);
      this.pendingRequests.delete(cacheKey);
      // Return empty structure that matches expected format
      return { list: [] };
    });

    this.pendingRequests.set(cacheKey, request);
    return request;
  }

  async create(data: Record<string, unknown>[]) {
    const response = await axiosInstance.post(`${this.baseURL}/api/v2/tables/${this.tableId}/records`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async update(data: Array<{ Id: string } & Record<string, unknown>>) {
    const updatePromises = data.map(item =>
      axiosInstance.patch(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${item.Id}`, item, {
        headers: this.getHeaders()
      })
    );
    return Promise.all(updatePromises);
  }

  async delete(ids: Array<{ Id: string }>) {
    const deletePromises = ids.map(item =>
      axiosInstance.delete(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${item.Id}`, {
        headers: this.getHeaders()
      })
    );
    return Promise.all(deletePromises);
  }

  async read(recordId: number, params?: { fields?: string[] }) {
    const response = await axiosInstance.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${recordId}`, {
      headers: this.getHeaders(),
      params: {
        fields: params?.fields?.join(',')
      }
    });
    return response.data;
  }

  async nested(recordId: number, params?: { nestedField?: string }) {
    const response = await axiosInstance.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records/${recordId}/nested`, {
      headers: this.getHeaders(),
      params: {
        nestedField: params?.nestedField
      }
    });
    return response.data;
  }

  async count(params?: { where?: string }) {
    const response = await axiosInstance.get(`${this.baseURL}/api/v2/tables/${this.tableId}/records/count`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }
}

export default NocoDBService;
