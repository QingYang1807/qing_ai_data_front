declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL: string;
      NEXT_PUBLIC_DATASOURCE_API_URL: string;
      NEXT_PUBLIC_DATASET_API_URL: string;
    }
  }
}

export {}; 