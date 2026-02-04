/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GRAPHQL_URL: string;
  readonly VITE_AZURE_AD_CLIENT_ID: string;
  readonly VITE_AZURE_AD_TENANT_ID: string;
  readonly VITE_DAB_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
