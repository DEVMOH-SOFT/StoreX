import { Router } from 'express';
import { validateCheckout } from '../controllers/checkout.controller.js';

export const checkoutRouter = Router();

checkoutRouter.post('/validate', validateCheckout);
