import { env } from "../util/env";

export interface CookieConfig {
  httpOnly: boolean;
  maxAge: number;
  domain?: string;
  secure?: boolean;
  sameSite?: "none" | "lax" | "strict";
}

export interface RemoveCookieConfig {
  sameSite?: "none" | "lax" | "strict";
  secure?: boolean;
}

export interface Config {
  PORT: number;
  DATABASE_URL: string;
  allowedOrigins: string[];
  cookieConfig: CookieConfig;
}

const config: Config = {
  PORT: parseInt(env("PORT", "8000"), 10),
  DATABASE_URL: env("DATABASE_URL"),
  allowedOrigins: [env("FRONTEND_URL", "http://localhost:3000")],
  cookieConfig:
    process.env.NODE_ENV === "production"
      ? {
          httpOnly: true,
          maxAge: 15552000000,
          secure: true,
          domain: ".datburnt.arnav.fish",
          sameSite: "lax",
        }
      : { httpOnly: true, maxAge: 15552000000 },
};

export default config;
