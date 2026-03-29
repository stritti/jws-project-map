import httpClient from "@/services/api/http.client";

type SortEntry = { direction: "asc" | "desc"; field: string };
type SortParam = string | SortEntry[];

function convertSort(sort?: SortParam): string | undefined {
  if (!sort) return undefined;
  if (Array.isArray(sort)) return JSON.stringify(sort);
  // Convert v2 string format "field1,-field2" to v3 JSON array
  const sortArray: SortEntry[] = sort.split(",").map((field) => {
    const trimmed = field.trim();
    const desc = trimmed.startsWith("-");
    return {
      direction: desc ? "desc" : "asc",
      field: desc ? trimmed.slice(1) : trimmed,
    };
  });
  return JSON.stringify(sortArray);
}

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
    sort?: SortParam;
    fields?: string[];
  }): Promise<{ list: T[] }> {
    const pageSize = params?.limit;
    const page =
      params?.offset !== undefined && pageSize
        ? Math.floor(params.offset / pageSize) + 1
        : undefined;

    return httpClient
      .get(`/api/v3/data/${this.baseId}/${this.tableId}/records`, {
        params: {
          where: params?.where,
          page,
          pageSize,
          viewId: params?.viewId,
          sort: convertSort(params?.sort),
          fields: params?.fields?.join(","),
        },
      })
      .then((response) => response.data as { list: T[] })
      .catch((error) => {
        console.error(error);
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

  async update(data: Array<{ Id: string } & Record<string, unknown>>) {
    const response = await httpClient.patch(
      `/api/v3/data/${this.baseId}/${this.tableId}/records`,
      data,
    );
    return response.data;
  }

  async delete(ids: Array<{ Id: string }>) {
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
