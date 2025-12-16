import { Elysia } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth';
import config from './config';

const port = config.PORT || 4000;

const app = new Elysia()
  .use(cookie())
  .use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'x-auth-token',
        'Authorization',
      ],
    })
  )
  .get('/', () => 'Hare Rama')
  .use(authRoutes)
  .listen(port);

console.log(
  `🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`
);

console.log('Note: WebSocket functionality needs to be migrated separately.');
console.log('The original Socket.io code has been converted to TypeScript in websocket/*.ts files.');

export default app;
