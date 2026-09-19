import { Request, Response } from 'express';
import { getRepository } from '../db/index.js';

export async function getProfile(_req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const customer = await repo.getCustomer();
    const orders = await repo.getOrders();

    const totalOrders = orders.length;
    const activeOrders = orders.filter(
      o => o.status !== 'Delivered' && o.status !== 'Cancelled'
    ).length;

    res.status(200).json({
      success: true,
      profile: {
        ...customer,
        metrics: {
          totalOrders,
          activeOrders,
          walletBalance: customer?.walletBalance || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in getProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile',
      message: error.message,
    });
  }
}
