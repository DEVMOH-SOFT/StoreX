import express, { Express, Request, Response } from 'express';
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
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const repo = getRepository();
    res.status(200).json({
      status: 'ok',
      service: 'StoreX API Backend',
      driver: repo.driverName,
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/account', accountRouter);

  return app;
}
