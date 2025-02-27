/// <reference types="vite/client" />


interface ImportMetaEnv {
  readonly ZENDESK_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
