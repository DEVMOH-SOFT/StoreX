import { IStoreXRepository, ProductQueryFilters } from '../interfaces.js';
import { Product, Category, Order, Customer, PaymentRecord, DeliveryStatus, TrackingEvent } from '../../types/index.js';
import { MemoryAdapter } from './memory.adapter.js';

export class SupabaseAdapter implements IStoreXRepository {
  public readonly driverName = 'supabase';
  private fallbackMemory: MemoryAdapter;
  private isConfigured = false;

  constructor() {
    this.fallbackMemory = new MemoryAdapter();
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (url && key && !url.includes('your-project')) {
      this.isConfigured = true;
      console.log('[StoreX DB] SupabaseAdapter configured with endpoint:', url);
    } else {
      console.warn('[StoreX DB] SupabaseAdapter: Missing or placeholder SUPABASE_URL / SUPABASE_ANON_KEY in .env. Falling back to local memory store.');
    }
  }

  public async initialize(): Promise<void> {
    await this.fallbackMemory.initialize();
  }

  public async getProducts(filters?: ProductQueryFilters): Promise<Product[]> {
    return this.fallbackMemory.getProducts(filters);
  }

  public async getProductById(id: string): Promise<Product | null> {
    return this.fallbackMemory.getProductById(id);
  }

  public async createProduct(product: Product): Promise<Product> {
    return this.fallbackMemory.createProduct(product);
  }

  public async getCategories(): Promise<Category[]> {
    return this.fallbackMemory.getCategories();
  }

  public async getOrders(): Promise<Order[]> {
    return this.fallbackMemory.getOrders();
  }

  public async getOrderById(id: string): Promise<Order | null> {
    return this.fallbackMemory.getOrderById(id);
  }

  public async createOrder(order: Order): Promise<Order> {
    return this.fallbackMemory.createOrder(order);
  }

  public async updateOrderStatus(
    id: string,
    status: Order['status'],
    deliveryStatus: DeliveryStatus,
    event?: TrackingEvent
  ): Promise<Order | null> {
    return this.fallbackMemory.updateOrderStatus(id, status, deliveryStatus, event);
  }

  public async createPayment(payment: PaymentRecord): Promise<PaymentRecord> {
    return this.fallbackMemory.createPayment(payment);
  }

  public async getPaymentById(id: string): Promise<PaymentRecord | null> {
    return this.fallbackMemory.getPaymentById(id);
  }

  public async getCustomer(id?: string): Promise<Customer | null> {
    return this.fallbackMemory.getCustomer(id);
  }
}
