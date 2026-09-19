import { Request, Response } from 'express';
import crypto from 'crypto';
import { getRepository } from '../db/index.js';
import { PaymentMethodType, PaymentRecord } from '../types/index.js';

export async function createPayment(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const {
      orderId,
      amount,
      currency = 'NGN',
      method = 'card',
      cardDetails,
    } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid payment amount',
      });
      return;
    }

    const validMethods: PaymentMethodType[] = ['card', 'transfer', 'wallet'];
    if (!validMethods.includes(method)) {
      res.status(400).json({
        success: false,
        error: `Invalid payment method. Allowed: ${validMethods.join(', ')}`,
      });
      return;
    }

    // Validation per method
    let transactionPrefix = 'tx_storex';
    if (method === 'card') {
      transactionPrefix = 'tx_stripe';
      // If card details provided, validate format
      if (cardDetails && cardDetails.cardNumber) {
        const cleanCard = cardDetails.cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 12) {
          res.status(400).json({
            success: false,
            error: 'Invalid card number format',
          });
          return;
        }
      }
    } else if (method === 'transfer') {
      transactionPrefix = 'tx_zenith_bank';
    } else if (method === 'wallet') {
      transactionPrefix = 'tx_wallet';
    }

    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const transactionId = `${transactionPrefix}_${crypto.randomBytes(6).toString('hex')}`;

    const paymentRecord: PaymentRecord = {
      id: paymentId,
      orderId: orderId || `STX-TEMP-${Date.now()}`,
      amount: Number(amount),
      currency: currency.toUpperCase(),
      method: method as PaymentMethodType,
      status: 'succeeded',
      transactionId,
      createdAt: new Date().toISOString(),
    };

    const saved = await repo.createPayment(paymentRecord);

    res.status(201).json({
      success: true,
      payment: saved,
      message: 'Payment authorized and processed successfully',
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in createPayment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed',
      message: error.message,
    });
  }
}

export async function getPaymentById(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const { id } = req.params;

    const payment = await repo.getPaymentById(id);
    if (!payment) {
      res.status(404).json({
        success: false,
        error: `Payment record '${id}' not found`,
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error(`[StoreX API] Error in getPaymentById(${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment',
      message: error.message,
    });
  }
}

export async function refundPayment(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const { paymentId, reason = 'customer_requested' } = req.body;

    if (!paymentId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: paymentId',
      });
      return;
    }

    const payment = await repo.getPaymentById(paymentId);
    if (!payment) {
      res.status(404).json({
        success: false,
        error: `Payment '${paymentId}' not found`,
      });
      return;
    }

    payment.status = 'refunded';
    await repo.createPayment(payment);

    res.status(200).json({
      success: true,
      refundId: `ref_${Date.now()}`,
      paymentId: payment.id,
      status: 'refunded',
      reason,
      refundedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in refundPayment:', error);
    res.status(500).json({
      success: false,
      error: 'Refund processing failed',
      message: error.message,
    });
  }
}
