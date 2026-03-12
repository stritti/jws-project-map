import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_NOCODB_URL,
  headers: {
    "Content-Type": "application/json",
    "xc-token": import.meta.env.VITE_APP_NOCODB_TOKEN,
  },
});

export default httpClient;
