import 'dotenv/config';
import { createServer } from './server.js';

async function bootstrap() {
  const app = createServer();
  const port = Number(process.env.BACKEND_PORT || 7006);

  const server = app.listen(port, () => {
    const origin =
      process.env.NG_APP_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      '*';
    const health = process.env.NG_APP_HEALTHCHECK_PATH || '/healthz';
    console.log(`[nodejs_backend] Listening on http://0.0.0.0:${port}`);
    console.log(`[nodejs_backend] CORS allowed origin: ${origin}`);
    console.log(`[nodejs_backend] Healthcheck: GET ${health}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[nodejs_backend] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[nodejs_backend] HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[nodejs_backend] Force exit after timeout.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[nodejs_backend] Bootstrap error:', err);
  process.exit(1);
});
