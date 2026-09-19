import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getRepository } from './db/index.js';
import { productsRouter } from './routes/products.routes.js';
import { categoriesRouter } from './routes/categories.routes.js';
import { checkoutRouter } from './routes/checkout.routes.js';
import { paymentsRouter } from './routes/payments.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { accountRouter } from './routes/account.routes.js';

// Load environment variables
dotenv.config();

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // Body parser with graceful malformed JSON handling
  app.use(express.json({ limit: '1mb' }));
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({
        success: false,
        error: 'Malformed JSON payload in request body',
      });
      return;
    }
    next(err);
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const repo = getRepository();
    res.status(200).json({
      status: 'ok',
      service: 'StoreX API Backend',
      driver: repo.driverName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // REST API Routes
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/account', accountRouter);

  // 404 Catch-All Handler for unknown API endpoints
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API endpoint '${req.method} ${req.baseUrl}' not found`,
      code: 'ENDPOINT_NOT_FOUND',
    });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[StoreX Server] Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error occurred',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    });
  });

  return app;
}
