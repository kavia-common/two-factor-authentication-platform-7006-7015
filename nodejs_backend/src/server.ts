import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { authRouter } from './views/auth.routes.js';
import { InMemoryDB } from './db/index.js';

export function createServer() {
  const app = express();

  // Trust proxy if running behind proxies (configurable via env if needed)
  if (process.env.NG_APP_TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  // Middlewares
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true
    })
  );

  const logLevel = process.env.NG_APP_LOG_LEVEL || 'dev';
  app.use(morgan(logLevel));

  // Simple health check
  const healthPath = process.env.NG_APP_HEALTHCHECK_PATH || '/healthz';
  app.get(healthPath, (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Attach DB to request context
  app.use((req: Request & { db?: InMemoryDB }, _res: Response, next: NextFunction) => {
    req.db = db;
    next();
  });

  // Routes
  app.use('/auth', authRouter);

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' });
  });

  return app;
}

// Global singleton in-memory DB for the app lifecycle
export const db = new InMemoryDB();
