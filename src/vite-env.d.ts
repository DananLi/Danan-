/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOLC_API_KEY: string;
  readonly VITE_GOOGLE_SEARCH_KEY: string;
  readonly VITE_GOOGLE_SEARCH_CX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
