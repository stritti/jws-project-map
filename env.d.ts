/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NOCODB_URL: string;
  readonly VITE_APP_NOCODB_TOKEN: string;
  readonly VITE_APP_NOCODB_BASE_ID: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global version variable injected via `define` in vite.config.ts
export {};

declare global {
  const __APP_VERSION__: string;

  interface Window {
    __APP_VERSION__: string;
  }
}
