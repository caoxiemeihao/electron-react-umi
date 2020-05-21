declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PUBLIC_URL: string;
  }
}

declare namespace global {
  interface Window {
    G: {
      isDev: boolean;
    };
  }
}
