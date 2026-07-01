import httpClient from "@/services/api/http.client";

export type SortEntry = { direction: "asc" | "desc"; field: string };

/**
 * Simple in-memory cache for NocoDB requests
 * Caches GET requests to avoid duplicate API calls
 */
class RequestCache {
  private cache = new Map<string, { data: unknown; timestamp: number; promise: Promise<unknown> | null }>();
  private ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // Default: 5 minutes
    this.ttlMs = ttlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now(), promise: null });
  }

  getOrSet<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    // Check if there's already a pending request for this key
    const entry = this.cache.get(key);
    if (entry?.promise) {
      return entry.promise as Promise<T>;
    }

    // Create new request and cache the promise
    const promise = fetchFn()
      .then((data) => {
        this.set(key, data);
        return data;
      })
      .catch((error) => {
        this.cache.delete(key);
        throw error;
      });

    this.cache.set(key, { data: null, timestamp: Date.now(), promise });
    return promise;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Shared cache instance for all NocoDB services
const requestCache = new RequestCache(5 * 60 * 1000); // 5 minutes TTL

export class NocoDBService {
  private tableId: string;
  private baseId: string;

  constructor(tableId: string, baseId?: string) {
    this.tableId = tableId;
    const resolvedBaseId = baseId ?? import.meta.env.VITE_APP_NOCODB_BASE_ID;
    if (!resolvedBaseId) {
      throw new Error(
        "NocoDBService: baseId is required. Set the VITE_APP_NOCODB_BASE_ID environment variable or pass baseId to the constructor.",
      );
    }
    this.baseId = resolvedBaseId;
  }

  list<T = Record<string, unknown>>(params?: {
    where?: string;
    offset?: number;
    limit?: number;
    viewId?: string;
    sort?: SortEntry[];
    fields?: string[];
  }): Promise<{ list: T[] }> {
    const pageSize = params?.limit;
    let page: number | undefined;
    if (pageSize && params?.offset !== undefined) {
      if (params.offset % pageSize === 0) {
        page = params.offset / pageSize + 1;
      } else {
        console.warn(
          "NocoDBService.list: 'offset' must be a multiple of 'limit' to be converted to a page. Ignoring 'offset' value:",
          params.offset,
        );
      }
    }

    // Generate cache key based on parameters
    const cacheKey = `list:${this.baseId}:${this.tableId}:${JSON.stringify({
      where: params?.where,
      page,
      pageSize,
      viewId: params?.viewId,
      sort: params?.sort,
      fields: params?.fields?.join(","),
    })}`;

    return requestCache.getOrSet<{ list: T[] }>(cacheKey, async () => {
      const response = await httpClient
        .get(`/api/v3/data/${this.baseId}/${this.tableId}/records`, {
          params: {
            where: params?.where,
            page,
            pageSize,
            viewId: params?.viewId,
            sort: JSON.stringify(params?.sort),
            fields: params?.fields?.join(","),
          },
        })
        .then((response) => {
          const data = response.data as Record<string, unknown>;

          if (data?.list && Array.isArray(data.list)) {
            return { list: data.list as T[] };
          }
          if (data?.records && Array.isArray(data.records)) {
            return { list: data.records as T[] };
          }
          console.warn(
            "NocoDBService.list: Unexpected response structure:",
            data,
          );
          return { list: [] as T[] };
        })
        .catch((error) => {
          console.error("NocoDBService.list error:", error);
          return { list: [] as T[] };
        });

      return response;
    });
  }

  async create(data: Record<string, unknown>[]) {
    const response = await httpClient.post(
      `/api/v3/data/${this.baseId}/${this.tableId}/records`,
      data,
    );
    // Clear cache for this table after mutation
    requestCache.clear();
    return response.data;
  }

  async update(data: Array<{ Id: number } & Record<string, unknown>>) {
    const response = await httpClient.patch(
      `/api/v3/data/${this.baseId}/${this.tableId}/records`,
      data,
    );
    requestCache.clear();
    return response.data;
  }

  async delete(ids: Array<{ Id: number }>) {
    const response = await httpClient.delete(
      `/api/v3/data/${this.baseId}/${this.tableId}/records`,
      { data: ids },
    );
    requestCache.clear();
    return response.data;
  }

  async read(recordId: number, params?: { fields?: string[] }) {
    const cacheKey = `read:${this.baseId}:${this.tableId}:${recordId}:${params?.fields?.join(",")}`;
    
    return requestCache.getOrSet(cacheKey, async () => {
      const response = await httpClient.get(
        `/api/v3/data/${this.baseId}/${this.tableId}/records/${recordId}`,
        {
          params: {
            fields: params?.fields?.join(","),
          },
        },
      );
      return response.data;
    });
  }

  async count(params?: { where?: string }) {
    const cacheKey = `count:${this.baseId}:${this.tableId}:${params?.where}`;
    
    return requestCache.getOrSet(cacheKey, async () => {
      const response = await httpClient.get(
        `/api/v3/data/${this.baseId}/${this.tableId}/count`,
        {
          params,
        },
      );
      return response.data;
    });
  }
}

export default NocoDBService;
