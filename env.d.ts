/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NOCODB_URL: string;
  readonly VITE_APP_NOCODB_TOKEN: string;
  readonly VITE_APP_NOCODB_BASE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global version variable injected by vite-plugin-package-version
declare const __APP_VERSION__: string;

// Extend Window interface to include the version
export {};

declare global {
  interface Window {
    __APP_VERSION__: string;
  }
}
