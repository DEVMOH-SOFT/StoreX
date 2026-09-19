import { Request, Response } from 'express';
import { getRepository } from '../db/index.js';

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const categories = await repo.getCategories();

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in getCategories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message,
    });
  }
}
