import axios from "axios";

/**
 * A request that never settles leaves the UI on its loading skeleton forever.
 * NocoDB answers the full project query in a few seconds, so cap every call
 * well above that and let the caller offer a retry.
 */
export const REQUEST_TIMEOUT_MS = 30_000;

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_NOCODB_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    "xc-token": import.meta.env.VITE_APP_NOCODB_TOKEN,
  },
});

export default httpClient;
