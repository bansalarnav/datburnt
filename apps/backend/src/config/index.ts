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

export interface S3Config {
  endpoint: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface Config {
  PORT: number;
  DATABASE_URL: string;
  allowedOrigins: string[];
  cookieConfig: CookieConfig;
  s3: S3Config;
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
  s3: {
    endpoint: env("S3_ENDPOINT"),
    bucketName: env("S3_BUCKET_NAME"),
    accessKeyId: env("S3_ACCESS_KEY_ID"),
    secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
  },
};

export default config;
