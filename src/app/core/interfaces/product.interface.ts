export type ProductType = 'saas' | 'digital' | 'physical';

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  productType: ProductType;
  priceMonthly?: number;
  priceYearly?: number;
  priceUnit?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  primaryImageUrl?: string;
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
