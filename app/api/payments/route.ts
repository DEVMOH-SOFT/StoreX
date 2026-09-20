import { NextRequest, NextResponse } from 'next/server';
import { recordPayment } from '@/lib/supabase';
import { PaymentMethodType } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, currency = 'NGN', method, cardDetails } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }

    if (!method || !['card', 'transfer', 'wallet'].includes(method)) {
      return NextResponse.json(
        { success: false, error: 'Valid payment method (card, transfer, wallet) is required' },
        { status: 400 }
      );
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `PAY-${Date.now()}`;

    const paymentRecord = {
      id: paymentId,
      orderId: orderId || `ORD-${Date.now()}`,
      amount: Number(amount),
      currency,
      status: 'SUCCESS',
      transactionId,
      method: method as PaymentMethodType,
    };

    await recordPayment(paymentRecord);

    return NextResponse.json({
      success: true,
      payment: paymentRecord,
    });
  } catch (error: any) {
    console.error('[API Payments Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed', message: error.message },
      { status: 500 }
    );
  }
}
