import { env } from "./utils/env";

export interface CookieConfig {
  httpOnly: boolean;
  maxAge: number;
  secure?: boolean;
  sameSite?: 'none' | 'lax' | 'strict';
}

export interface RemoveCookieConfig {
  sameSite?: 'none' | 'lax' | 'strict';
  secure?: boolean;
}

export interface Config {
  PORT: number;
  DATABASE_URL: string;
  allowedOrigins: string[];
  cookieConfig: CookieConfig;
}

const config: Config = {
  PORT: parseInt(env('PORT', '4000')),
  DATABASE_URL: env("DATABASE_URL"),
  allowedOrigins: [env('FRONTEND_URL', 'http://localhost:3000')],
  cookieConfig:
    process.env.NODE_ENV === 'production'
      ? {
        httpOnly: true,
        maxAge: 15552000000,
        secure: true,
        sameSite: 'none',
      }
      : { httpOnly: true, maxAge: 15552000000 },
};

export default config;
