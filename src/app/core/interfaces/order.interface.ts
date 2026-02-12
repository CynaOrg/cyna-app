export interface ProductSnapshot {
  name: string;
  nameEn?: string;
  nameFr?: string;
  slug?: string;
  productType?: string;
  price?: number;
  image?: string | null;
}

export interface AddressSnapshot {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  state?: string;
  [key: string]: any;
}

export interface OrderItem {
  id: string;
  productId: string;
  productSnapshot: ProductSnapshot;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  billingPeriod?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  orderType?: string;
  billingAddressSnapshot: AddressSnapshot;
  shippingAddressSnapshot?: AddressSnapshot | null;
  currency?: string;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}
