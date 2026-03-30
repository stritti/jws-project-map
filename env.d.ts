/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NOCODB_URL: string;
  readonly VITE_APP_NOCODB_TOKEN: string;
  readonly VITE_APP_NOCODB_BASE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
