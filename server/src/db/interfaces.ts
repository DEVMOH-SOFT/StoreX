import { Product, Category, Order, Customer, PaymentRecord, DeliveryStatus, TrackingEvent } from '../types/index.js';

export interface ProductQueryFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating';
  deals?: boolean;
  featured?: boolean;
}

export interface IStoreXRepository {
  readonly driverName: string;
  initialize(): Promise<void>;

  // Products
  getProducts(filters?: ProductQueryFilters): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: Product): Promise<Product>;

  // Categories
  getCategories(): Promise<Category[]>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(order: Order): Promise<Order>;
  updateOrderStatus(id: string, status: Order['status'], deliveryStatus: DeliveryStatus, event?: TrackingEvent): Promise<Order | null>;

  // Payments
  createPayment(payment: PaymentRecord): Promise<PaymentRecord>;
  getPaymentById(id: string): Promise<PaymentRecord | null>;

  // Customers
  getCustomer(id?: string): Promise<Customer | null>;
}
