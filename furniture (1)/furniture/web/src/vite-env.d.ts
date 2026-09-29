/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the API for production builds, e.g. https://api.example.com. Unset in development. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
