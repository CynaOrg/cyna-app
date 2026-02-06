export type ProductType = 'saas' | 'digital' | 'physical';

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  productType: ProductType;
  priceMonthly?: number;
  priceYearly?: number;
  priceUnit?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  primaryImageUrl?: string;
  images?: ProductImage[];
  categoryName?: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  categorySlug?: string;
  productType?: ProductType;
  isFeatured?: boolean;
  search?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
