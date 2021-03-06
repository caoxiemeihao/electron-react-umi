declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PUBLIC_URL: string;
  }
}

interface Window {
  G: {
    /** 是否为开发环境 */
    isDev: boolean;
  };
}

/** 主题颜色 */
declare const APP_THEME: string;
