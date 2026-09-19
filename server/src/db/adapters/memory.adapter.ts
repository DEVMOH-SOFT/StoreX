import { IStoreXRepository, ProductQueryFilters } from '../interfaces.js';
import { Product, Category, Order, Customer, PaymentRecord, DeliveryStatus, TrackingEvent } from '../../types/index.js';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_ORDERS, SEED_CUSTOMER } from '../seedData.js';

export class MemoryAdapter implements IStoreXRepository {
  public readonly driverName = 'memory';

  private products: Map<string, Product> = new Map();
  private categories: Category[] = [];
  private orders: Map<string, Order> = new Map();
  private payments: Map<string, PaymentRecord> = new Map();
  private customer: Customer | null = null;
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Seed Products
    for (const prod of SEED_PRODUCTS) {
      this.products.set(prod.id, { ...prod });
    }

    // Seed Categories with dynamic counts
    this.categories = SEED_CATEGORIES.map(cat => ({ ...cat }));

    // Seed Orders
    for (const order of SEED_ORDERS) {
      this.orders.set(order.id, JSON.parse(JSON.stringify(order)));
    }

    // Seed Customer
    this.customer = JSON.parse(JSON.stringify(SEED_CUSTOMER));

    this.isInitialized = true;
    console.log(`[StoreX DB] MemoryAdapter initialized with ${this.products.size} products and ${this.orders.size} demo orders.`);
  }

  // Products
  public async getProducts(filters?: ProductQueryFilters): Promise<Product[]> {
    let result = Array.from(this.products.values());

    if (filters) {
      // Category filter
      if (filters.category && filters.category !== 'All Products') {
        const cat = filters.category.toLowerCase();
        result = result.filter(p => p.category.toLowerCase() === cat);
      }

      // Search query filter
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }

      // Min price filter
      if (typeof filters.minPrice === 'number') {
        result = result.filter(p => p.price >= filters.minPrice!);
      }

      // Max price filter
      if (typeof filters.maxPrice === 'number') {
        result = result.filter(p => p.price <= filters.maxPrice!);
      }

      // Deals filter
      if (filters.deals) {
        result = result.filter(p => Boolean(p.discountBadge || (p.oldPrice && p.oldPrice > p.price)));
      }

      // Featured filter
      if (filters.featured) {
        result = result.filter(p => Boolean(p.isFeatured));
      }

      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
          case 'featured':
          default:
            result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
            break;
        }
      }
    }

    return result;
  }

  public async getProductById(id: string): Promise<Product | null> {
    const targetId = id.toLowerCase();
    for (const [key, val] of this.products.entries()) {
      if (key.toLowerCase() === targetId) {
        return { ...val };
      }
    }
    return null;
  }

  public async createProduct(product: Product): Promise<Product> {
    this.products.set(product.id, { ...product });
    return { ...product };
  }

  // Categories
  public async getCategories(): Promise<Category[]> {
    return this.categories.map(c => {
      const count = Array.from(this.products.values()).filter(p => p.category === c.name).length;
      return {
        ...c,
        count: `${count}+ products`
      };
    });
  }

  // Orders
  public async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  public async getOrderById(id: string): Promise<Order | null> {
    const targetId = id.toLowerCase();
    for (const [key, val] of this.orders.entries()) {
      if (key.toLowerCase() === targetId) {
        return JSON.parse(JSON.stringify(val));
      }
    }
    return null;
  }

  public async createOrder(order: Order): Promise<Order> {
    this.orders.set(order.id, JSON.parse(JSON.stringify(order)));
    return JSON.parse(JSON.stringify(order));
  }

  public async updateOrderStatus(
    id: string,
    status: Order['status'],
    deliveryStatus: DeliveryStatus,
    event?: TrackingEvent
  ): Promise<Order | null> {
    const order = await this.getOrderById(id);
    if (!order) return null;

    order.status = status;
    order.delivery.status = deliveryStatus;

    if (event) {
      order.delivery.events.push(event);
    }

    this.orders.set(order.id, JSON.parse(JSON.stringify(order)));
    return order;
  }

  // Payments
  public async createPayment(payment: PaymentRecord): Promise<PaymentRecord> {
    this.payments.set(payment.id, { ...payment });
    return { ...payment };
  }

  public async getPaymentById(id: string): Promise<PaymentRecord | null> {
    const payment = this.payments.get(id);
    return payment ? { ...payment } : null;
  }

  // Customers
  public async getCustomer(_id?: string): Promise<Customer | null> {
    return this.customer ? JSON.parse(JSON.stringify(this.customer)) : null;
  }
}
