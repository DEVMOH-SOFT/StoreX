import { Request, Response } from 'express';
import { getRepository } from '../db/index.js';
import { ProductQueryFilters } from '../db/interfaces.js';

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      deals,
      featured,
    } = req.query;

    const filters: ProductQueryFilters = {};

    if (typeof category === 'string' && category.trim()) {
      filters.category = category.trim();
    }
    if (typeof search === 'string' && search.trim()) {
      filters.search = search.trim();
    }
    if (minPrice && !isNaN(Number(minPrice))) {
      filters.minPrice = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      filters.maxPrice = Number(maxPrice);
    }
    if (typeof sortBy === 'string' && ['featured', 'newest', 'price-low', 'price-high', 'rating'].includes(sortBy)) {
      filters.sortBy = sortBy as ProductQueryFilters['sortBy'];
    }
    if (deals === 'true' || deals === '1') {
      filters.deals = true;
    }
    if (featured === 'true' || featured === '1') {
      filters.featured = true;
    }

    const products = await repo.getProducts(filters);

    res.status(200).json({
      success: true,
      count: products.length,
      filters,
      products,
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in getProducts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message,
    });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const { id } = req.params;

    const product = await repo.getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        error: `Product with ID '${id}' not found`,
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error(`[StoreX API] Error in getProductById(${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product details',
      message: error.message,
    });
  }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const body = req.body;

    if (!body.name || !body.price || !body.category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, price, category are required',
      });
      return;
    }

    const newProduct = {
      id: body.id || `stx-${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name: body.name,
      category: body.category,
      price: Number(body.price),
      oldPrice: body.oldPrice ? Number(body.oldPrice) : undefined,
      discountBadge: body.discountBadge,
      rating: body.rating ? Number(body.rating) : 5.0,
      reviewCount: body.reviewCount ? Number(body.reviewCount) : 1,
      inStock: body.inStock !== false,
      isNew: Boolean(body.isNew),
      isFeatured: Boolean(body.isFeatured),
      image: body.image || '/images/products/placeholder.jpg',
      images: body.images || [body.image || '/images/products/placeholder.jpg'],
      description: body.description || '',
      specs: body.specs || [],
      colors: body.colors || [],
    };

    const created = await repo.createProduct(newProduct);

    res.status(201).json({
      success: true,
      product: created,
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in createProduct:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message,
    });
  }
}
