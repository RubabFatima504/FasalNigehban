/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL. Defaults to http://localhost:8000 in api.ts if unset. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
