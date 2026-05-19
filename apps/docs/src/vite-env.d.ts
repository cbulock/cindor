/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOCS_SITE_URL?: string;
  readonly VITE_PLAYGROUND_URL?: string;
  readonly VITE_PRIMARY_SITE_URL?: string;
  readonly VITE_SITE_MODE?: "docs" | "landing";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
