import { Address } from './address.interface';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  billingAddress: Address;
  shippingAddress?: Address;
  createdAt: string;
}
