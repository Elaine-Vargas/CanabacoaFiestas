/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_API_BASE_URL: string;
    
    // Variables para el backend (si las necesitas en el frontend)
    readonly VITE_DB_NAME?: string;
    readonly VITE_DB_USER?: string;
    readonly VITE_JWT_SECRET?: string;
    // ... otras variables que necesites en el frontend
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }