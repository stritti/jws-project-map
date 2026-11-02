/**
 * A request that never settles leaves the UI on its loading skeleton forever.
 * NocoDB answers the full project query in a few seconds, so cap every call
 * well above that and let the caller offer a retry.
 */
export const REQUEST_TIMEOUT_MS = 30_000;

const baseURL = import.meta.env.VITE_APP_NOCODB_URL;
const token = import.meta.env.VITE_APP_NOCODB_TOKEN;

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | QueryValue[]
  | { [key: string]: QueryValue };

type QueryParams = { [key: string]: QueryValue };

type RequestConfig = { params?: QueryParams; data?: unknown };

type Response<T = unknown> = { data: T; status: number };

function appendQueryValue(
  searchParams: URLSearchParams,
  key: string,
  value: QueryValue,
): void {
  if (value === null || value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      appendQueryValue(searchParams, `${key}[${index}]`, item),
    );
    return;
  }
  if (typeof value === "object") {
    for (const [entryKey, entryValue] of Object.entries(value)) {
      appendQueryValue(searchParams, `${key}[${entryKey}]`, entryValue);
    }
    return;
  }
  searchParams.append(key, String(value));
}

function buildUrl(url: string, params?: QueryParams): string {
  const requestUrl = baseURL
    ? new URL(`${baseURL}${url}`)
    : new URL(url, globalThis.location?.origin);
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      appendQueryValue(searchParams, key, value);
    }
    requestUrl.search = searchParams.toString();
  }
  return requestUrl.toString();
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  config?: RequestConfig,
): Promise<Response<T>> {
  const response = await fetch(buildUrl(url, config?.params), {
    method,
    headers: {
      "Content-Type": "application/json",
      "xc-token": token,
    },
    body: config?.data === undefined ? undefined : JSON.stringify(config.data),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  const text = await response.text();
  const data = (text ? JSON.parse(text) : undefined) as T;
  return { data, status: response.status };
}

const httpClient = {
  get: <T = unknown>(url: string, config?: RequestConfig) =>
    request<T>("GET", url, config),
  post: <T = unknown>(url: string, data?: unknown) =>
    request<T>("POST", url, { data }),
  patch: <T = unknown>(url: string, data?: unknown) =>
    request<T>("PATCH", url, { data }),
  delete: <T = unknown>(url: string, config?: RequestConfig) =>
    request<T>("DELETE", url, config),
};

export default httpClient;
