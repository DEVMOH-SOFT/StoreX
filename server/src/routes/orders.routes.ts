import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orders.controller.js';

export const ordersRouter = Router();

ordersRouter.get('/', getOrders);
ordersRouter.get('/:id', getOrderById);
ordersRouter.post('/', createOrder);
ordersRouter.patch('/:id/status', updateOrderStatus);
