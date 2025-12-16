import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { authRouter } from './views/auth.routes.js';
import { InMemoryDB } from './db/index.js';
import { rateLimiter } from './utils/rateLimiter.js';

export function createServer() {
  const app = express();

  if (process.env.NG_APP_TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  // Security and parsers
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // CORS from env FRONTEND_URL / NG_APP_FRONTEND_URL; default '*' for dev and proxy
  const allowedOrigin =
    process.env.NG_APP_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    '*';

  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // Logging
  const logLevel = process.env.NG_APP_LOG_LEVEL || 'dev';
  app.use(morgan(logLevel));

  console.log(
    `[nodejs_backend] createServer initialized. Using CORS origin="${allowedOrigin}". ` +
      `When using Angular dev proxy, origin does not apply to browser calls.`
  );

  // Healthcheck
  const healthPath = process.env.NG_APP_HEALTHCHECK_PATH || '/healthz';
  app.get(healthPath, (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Rate limiting (basic, IP-based)
  app.use(rateLimiter());

  // Attach DB to request
  app.use((req: Request & { db?: InMemoryDB }, _res: Response, next: NextFunction) => {
    req.db = db;
    next();
  });

  // Routes
  app.use('/auth', authRouter);

  // 404
  app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' });
  });

  return app;
}

export const db = new InMemoryDB();
