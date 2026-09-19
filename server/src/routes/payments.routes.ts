import { Router } from 'express';
import { createPayment, getPaymentById, refundPayment } from '../controllers/payments.controller.js';

export const paymentsRouter = Router();

paymentsRouter.post('/', createPayment);
paymentsRouter.get('/:id', getPaymentById);
paymentsRouter.post('/refund', refundPayment);
