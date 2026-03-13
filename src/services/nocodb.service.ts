import httpClient from "@/services/api/http.client";

export class NocoDBService {
  private tableId: string;

  constructor(tableId: string) {
    this.tableId = tableId;
  }

  list<T = Record<string, unknown>>(params?: {
    where?: string;
    offset?: number;
    limit?: number;
    viewId?: string;
    sort?: string;
    populate?: string;
    fields?: string[];
  }): Promise<{ list: T[] }> {
    return httpClient
      .get(`/api/v2/tables/${this.tableId}/records`, {
        params: {
          ...params,
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
      `/api/v2/tables/${this.tableId}/records`,
      data,
    );
    return response.data;
  }

  async update(data: Array<{ Id: string } & Record<string, unknown>>) {
    const updatePromises = data.map((item) =>
      httpClient.patch(
        `/api/v2/tables/${this.tableId}/records/${item.Id}`,
        item,
      ),
    );
    return Promise.all(updatePromises);
  }

  async delete(ids: Array<{ Id: string }>) {
    const deletePromises = ids.map((item) =>
      httpClient.delete(`/api/v2/tables/${this.tableId}/records/${item.Id}`),
    );
    return Promise.all(deletePromises);
  }

  async read(recordId: number, params?: { fields?: string[] }) {
    const response = await httpClient.get(
      `/api/v2/tables/${this.tableId}/records/${recordId}`,
      {
        params: {
          fields: params?.fields?.join(","),
        },
      },
    );
    return response.data;
  }

  async nested(recordId: number, params?: { nestedField?: string }) {
    const response = await httpClient.get(
      `/api/v2/tables/${this.tableId}/records/${recordId}/nested`,
      {
        params: {
          nestedField: params?.nestedField,
        },
      },
    );
    return response.data;
  }

  async count(params?: { where?: string }) {
    const response = await httpClient.get(
      `/api/v2/tables/${this.tableId}/records/count`,
      {
        params,
      },
    );
    return response.data;
  }
}

export default NocoDBService;
