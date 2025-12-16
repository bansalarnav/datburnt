import { Elysia } from 'elysia';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  id: string;
}

export const auth = new Elysia()
  .derive(async ({ cookie: { token }, set }) => {
    if (!token?.value) {
      set.status = 401;
      return {
        user: null,
        error: { success: false, message: 'Invalid token' }
      };
    }

    try {
      const decoded = jwt.verify(token.value, process.env.JWT_KEY!) as AuthPayload;
      return { user: decoded, error: null };
    } catch (e) {
      set.status = 401;
      return {
        user: null,
        error: { success: false, message: 'Invalid token' }
      };
    }
  })
  .as('plugin');
