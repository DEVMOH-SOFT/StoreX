import { Request, Response } from 'express';
import { getRepository } from '../db/index.js';
import { DeliveryMethodType } from '../types/index.js';

export async function validateCheckout(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const { items, deliveryMethod = 'standard' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Cart items cannot be empty',
      });
      return;
    }

    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.productId || item.product?.id;
      const quantity = Number(item.quantity) || 1;

      if (!productId) {
        res.status(400).json({
          success: false,
          error: 'Each item must have a valid productId',
        });
        return;
      }

      const product = await repo.getProductById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          error: `Product with ID '${productId}' no longer exists in catalog`,
        });
        return;
      }

      // Security: use the verified database price to prevent client tampering
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

    // Determine delivery fee based on method
    let deliveryFee = 2000; // default standard
    const method = deliveryMethod as DeliveryMethodType;
    if (method === 'express') {
      deliveryFee = 4000;
    } else if (method === 'pickup') {
      deliveryFee = 0;
    }

    const discount = 0;
    const total = subtotal + deliveryFee - discount;

    res.status(200).json({
      success: true,
      subtotal,
      deliveryFee,
      discount,
      total,
      itemCount: validatedItems.reduce((sum, item) => sum + item.quantity, 0),
      items: validatedItems,
      deliveryMethod: method,
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in validateCheckout:', error);
    res.status(500).json({
      success: false,
      error: 'Checkout validation failed',
      message: error.message,
    });
  }
}
