declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      ENCRYPTION_KEY: string;
      RATE: string;
      AUTH0_SECRET: string;
      AUTH0_BASE_URL: string;
      AUTH0_ISSUER_BASE_URL: string;
      AUTH0_CLIENT_ID: string;
      DEV_DB_URI_LOCAL: string;
      DEV_DB_URI_REMOTE: string;
      TEST_DB_URI: string;
      PROD_DB_URI: string;
      FLW_PUBLIC_KEY: string;
      FLW_PRIVATE_KEY: string;
      FLW_ENCRYPTION_KEY: string;
      FLW_WEBHOOK_HASH: string;
      JWT_ACCESS_KEY: string;
      JWT_FORM_KEY: string;
      JWT_REFRESH_KEY: string;
      JWT_ACCESS_TIME: string;
      JWT_REFRESH_TIME: string;
      JWT_FORM_TIME: string;
      JWT_TOKEN_AUDIENCE: string;
      JWT_ISSUER: string;
      CLIENT_SECRET: string;
      SENDER_EMAIL: string;
      OAUTH_PLAYGROUND: string;
      CLIENT_ID: string;
      REFRESH_TOKEN: string;
      MAX_SIMILARITY: string;
      PSK_SECRET_KEY: string;
      PSK_SECRET_KEY: string;
      PSK_PUBLIC_KEY: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      SALT: string;
    }
  }
}

export {};
