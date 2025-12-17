import { Elysia } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { cors } from '@elysiajs/cors';
import { userRoutes } from './routes/user';
import { websocketRoutes } from './ws';
import config from './config';

const port = config.PORT

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
  .use(userRoutes)
  .use(websocketRoutes)
  .listen(port);

console.log(
  `Server started at ${app.server?.hostname}:${app.server?.port}`
);

console.log('Note: WebSocket functionality needs to be migrated separately.');
console.log('The original Socket.io code has been converted to TypeScript in websocket/*.ts files.');

export default app;
