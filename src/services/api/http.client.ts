/**
 * HTTP Client using native fetch API
 * Replaces axios with lighter native fetch implementation
 * Reduces bundle size by ~10 KB
 */

const baseURL = import.meta.env.VITE_APP_NOCODB_URL;
const nocodbToken = import.meta.env.VITE_APP_NOCODB_TOKEN;

// Log configuration for debugging
console.log("[NocoDB HTTP Client] Initializing...");
console.log("[NocoDB HTTP Client] baseURL:", baseURL ? "SET" : "NOT SET");
console.log("[NocoDB HTTP Client] token:", nocodbToken ? "SET" : "NOT SET");

// Validate configuration on module load
if (!baseURL) {
  console.error(
    "[NocoDB HTTP Client] FATAL: VITE_APP_NOCODB_URL is not set. " +
    "API requests will fail. Please set this environment variable."
  );
}

if (!nocodbToken) {
  console.error(
    "[NocoDB HTTP Client] FATAL: VITE_APP_NOCODB_TOKEN is not set. " +
    "API requests will fail. Please set this environment variable."
  );
}

/**
 * HTTP Client interface compatible with axios-like usage
 */
export interface HttpClient {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
}

export interface RequestConfig {
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * Build URL with query parameters
 */
function buildURL(url: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return url;
  
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  
  const searchString = searchParams.toString();
  if (!searchString) return url;
  
  return url.includes('?') ? `${url}&${searchString}` : `${url}?${searchString}`;
}

/**
 * Build headers with CORS support
 */
function buildHeaders(): Headers {
  const result = new Headers({
    "Content-Type": "application/json",
  });
  
  if (nocodbToken) {
    result.append("xc-token", nocodbToken);
  }
  
  return result;
}

/**
 * Handle response and convert to HttpResponse format
 */
async function handleResponse<T>(response: Response): Promise<HttpResponse<T>> {
  const status = response.status;
  const statusText = response.statusText;
  const responseHeaders = response.headers;
  
  // Log response details for debugging
  console.log("[NocoDB HTTP Client] Response:", {
    url: response.url,
    status,
    statusText,
    ok: response.ok,
  });
  
  let data: T;
  try {
    data = await response.json();
  } catch {
    // If response is not JSON, return empty object
    data = {} as T;
  }
  
  if (!response.ok) {
    const error = new Error(`HTTP Error: ${status} ${statusText}`) as Error & {
      response?: HttpResponse<T>;
    };
    error.response = {
      data,
      status,
      statusText,
      headers: responseHeaders,
    };
    console.error("[NocoDB HTTP Client] Error:", error.message, { data, status, statusText });
    throw error;
  }
  
  return {
    data,
    status,
    statusText,
    headers: responseHeaders,
  };
}

/**
 * Fetch-based HTTP client
 * Note: In browser environments, fetch is available globally
 * In Node.js environments, you need to polyfill fetch
 */
const httpClient: HttpClient = {
  async get<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    if (!baseURL) {
      throw new Error(
        "[NocoDB HTTP Client] baseURL is not configured. " +
        "Set VITE_APP_NOCODB_URL environment variable."
      );
    }
    
    const fullURL = buildURL(`${baseURL}${url}`, config?.params);
    console.log("[NocoDB HTTP Client] GET:", fullURL);
    
    const response = await fetch(fullURL, {
      method: "GET",
      headers: buildHeaders(),
      mode: "cors", // Explicit CORS mode
      credentials: "omit", // Don't send cookies (NocoDB uses token in header)
    });
    return handleResponse<T>(response);
  },

  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>> {
    if (!baseURL) {
      throw new Error(
        "[NocoDB HTTP Client] baseURL is not configured. " +
        "Set VITE_APP_NOCODB_URL environment variable."
      );
    }
    
    const fullURL = buildURL(`${baseURL}${url}`, config?.params);
    console.log("[NocoDB HTTP Client] POST:", fullURL, "data:", data);
    
    const response = await fetch(fullURL, {
      method: "POST",
      headers: buildHeaders(),
      mode: "cors",
      credentials: "omit",
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse<T>> {
    if (!baseURL) {
      throw new Error(
        "[NocoDB HTTP Client] baseURL is not configured. " +
        "Set VITE_APP_NOCODB_URL environment variable."
      );
    }
    
    const fullURL = buildURL(`${baseURL}${url}`, config?.params);
    console.log("[NocoDB HTTP Client] PATCH:", fullURL, "data:", data);
    
    const response = await fetch(fullURL, {
      method: "PATCH",
      headers: buildHeaders(),
      mode: "cors",
      credentials: "omit",
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    if (!baseURL) {
      throw new Error(
        "[NocoDB HTTP Client] baseURL is not configured. " +
        "Set VITE_APP_NOCODB_URL environment variable."
      );
    }
    
    const fullURL = buildURL(`${baseURL}${url}`, config?.params);
    console.log("[NocoDB HTTP Client] DELETE:", fullURL);
    
    const response = await fetch(fullURL, {
      method: "DELETE",
      headers: buildHeaders(),
      mode: "cors",
      credentials: "omit",
      body: config?.data ? JSON.stringify(config.data) : undefined,
    });
    return handleResponse<T>(response);
  },
};

export default httpClient;
