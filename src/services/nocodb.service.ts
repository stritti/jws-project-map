import httpClient from "@/services/api/http.client";

export type SortEntry = { direction: "asc" | "desc"; field: string };

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

    return httpClient
      .get(`/api/v3/data/${this.baseId}/${this.tableId}/records`, {
        params: {
          where: params?.where,
          page,
          pageSize,
          viewId: params?.viewId,
          sort: params?.sort,
          fields: params?.fields?.join(","),
        },
      })
      .then((response) => {
        const data = response.data;

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
  }

  async create(data: Record<string, unknown>[]) {
    const response = await httpClient.post(
      `/api/v3/data/${this.baseId}/${this.tableId}/records`,
      data,
    );
    return response.data;
  }

  async update(data: Array<{ Id: number } & Record<string, unknown>>) {
    const response = await httpClient.patch(
      `/api/v3/data/${this.baseId}/${this.tableId}/records`,
      data,
    );
    return response.data;
  }

  async delete(ids: Array<{ Id: number }>) {
    const response = await httpClient.delete(
      `/api/v3/data/${this.baseId}/${this.tableId}/records`,
      { data: ids },
    );
    return response.data;
  }

  async read(recordId: number, params?: { fields?: string[] }) {
    const response = await httpClient.get(
      `/api/v3/data/${this.baseId}/${this.tableId}/records/${recordId}`,
      {
        params: {
          fields: params?.fields?.join(","),
        },
      },
    );
    return response.data;
  }

  async count(params?: { where?: string }) {
    const response = await httpClient.get(
      `/api/v3/data/${this.baseId}/${this.tableId}/count`,
      {
        params,
      },
    );
    return response.data;
  }
}

export default NocoDBService;
