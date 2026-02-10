/** Legacy local cart item (kept for reference during migration) */
export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  productType: 'saas' | 'physical' | 'license';
}

/** Product info returned inside a cart item from the API */
export interface CartProductInfo {
  nameFr: string;
  nameEn: string;
  slug: string;
  productType: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  priceUnit: number | null;
  isAvailable: boolean;
  stockQuantity: number | null;
  images: {
    id: string;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
  }[];
}

/** A single cart item as returned by the backend API */
export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  billingPeriod: string;
  product: CartProductInfo | null;
}

/** Full cart response from the backend API */
export interface CartResponse {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemResponse[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Request body for POST /cart/items */
export interface AddCartItemRequest {
  productId: string;
  quantity: number;
  billingPeriod?: string;
}

/** Request body for PATCH /cart/items/:productId */
export interface UpdateCartItemRequest {
  quantity: number;
}
