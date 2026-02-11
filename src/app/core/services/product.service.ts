import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './api.service';
import {
  Product,
  ProductDetail,
  ProductQuery,
  PaginatedResponse,
} from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);
  private readonly basePath = 'catalog/products';

  private get lang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'fr';
  }

  getProducts(query?: ProductQuery): Observable<PaginatedResponse<Product>> {
    const params: Record<string, string | number | boolean> = {
      lang: this.lang,
    };
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    if (query?.categorySlug) params['categorySlug'] = query.categorySlug;
    if (query?.productType) params['productType'] = query.productType;
    if (query?.isFeatured !== undefined)
      params['isFeatured'] = query.isFeatured;
    if (query?.search) params['search'] = query.search;
    return this.api.getPaginated<Product>(this.basePath, params);
  }

  getFeaturedProducts(limit = 6): Observable<Product[]> {
    return this.api.getList<Product>(`${this.basePath}/featured`, {
      limit,
      lang: this.lang,
    });
  }

  getProductBySlug(slug: string): Observable<ProductDetail> {
    return this.api.get<ProductDetail>(`${this.basePath}/${slug}`, {
      lang: this.lang,
    });
  }

  searchProducts(
    term: string,
    query?: ProductQuery,
  ): Observable<PaginatedResponse<Product>> {
    const params: Record<string, string | number | boolean> = {
      search: term,
      lang: this.lang,
    };
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    return this.api.getPaginated<Product>('catalog/search', params);
  }
}
