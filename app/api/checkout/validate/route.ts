import { NextRequest, NextResponse } from 'next/server';
import { fetchProductById } from '@/lib/supabase';
import { DeliveryMethodType } from '@/types';

export const dynamic = 'force-dynamic';

const DELIVERY_FEES: Record<DeliveryMethodType, number> = {
  standard: 2000,
  express: 5000,
  pickup: 0,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, deliveryMethod = 'standard' } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart items cannot be empty' },
        { status: 400 }
      );
    }

    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.productId || item.product?.id;
      const quantity = Number(item.quantity) || 1;

      if (!productId) {
        return NextResponse.json(
          { success: false, error: 'Each item must have a valid productId' },
          { status: 400 }
        );
      }

      const product = await fetchProductById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product with ID '${productId}' no longer exists in catalog` },
          { status: 404 }
        );
      }

      const verifiedPrice = product.price;
      const lineTotal = verifiedPrice * quantity;
      subtotal += lineTotal;

      validatedItems.push({
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: verifiedPrice,
          image: product.image,
        },
        quantity,
        selectedColor: item.selectedColor,
        lineTotal,
      });
    }

    const deliveryFee = DELIVERY_FEES[deliveryMethod as DeliveryMethodType] ?? 2000;
    const discount = 0;
    const total = subtotal + deliveryFee - discount;

    return NextResponse.json({
      success: true,
      subtotal,
      deliveryFee,
      discount,
      total,
      itemCount: validatedItems.reduce((acc, i) => acc + i.quantity, 0),
      items: validatedItems,
    });
  } catch (error: any) {
    console.error('[API Checkout Validate Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate checkout items', message: error.message },
      { status: 500 }
    );
  }
}
