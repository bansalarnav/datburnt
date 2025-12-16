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
  removeCookieConfig: RemoveCookieConfig;
}

const config: Config = {
  PORT: parseInt(process.env.PORT || '4000'),
  DATABASE_URL: process.env.DATABASE_URL || '',
  allowedOrigins:
    process.env.NODE_ENV === 'production'
      ? ['https://minet-metaverse.vercel.app']
      : ['http://localhost:3001'],
  cookieConfig:
    process.env.NODE_ENV === 'production'
      ? {
          httpOnly: true,
          maxAge: 15552000000,
          secure: true,
          sameSite: 'none',
        }
      : { httpOnly: true, maxAge: 15552000000 },
  removeCookieConfig:
    process.env.NODE_ENV === 'production'
      ? { sameSite: 'none', secure: true }
      : {},
};

export default config;
