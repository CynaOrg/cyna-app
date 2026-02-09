export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  productType: 'physical' | 'digital';
}
