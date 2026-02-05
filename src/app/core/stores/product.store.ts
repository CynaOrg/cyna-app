import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  map,
  distinctUntilChanged,
  catchError,
  of,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseStore } from './base.store';
import {
  Product,
  ProductQuery,
  PaginatedResponse,
} from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductStore extends BaseStore<Product[]> {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  readonly products$: Observable<Product[]> = this.data$.pipe(
    map((products) => products ?? []),
    distinctUntilChanged(),
  );

  readonly featured$: Observable<Product[]> = this.products$.pipe(
    map((products) => products.filter((p) => p.isFeatured)),
    distinctUntilChanged(),
  );

  readonly saasProducts$: Observable<Product[]> = this.products$.pipe(
    map((products) => products.filter((p) => p.productType === 'saas')),
    distinctUntilChanged(),
  );

  readonly physicalProducts$: Observable<Product[]> = this.products$.pipe(
    map((products) => products.filter((p) => p.productType === 'physical')),
    distinctUntilChanged(),
  );

  readonly digitalProducts$: Observable<Product[]> = this.products$.pipe(
    map((products) => products.filter((p) => p.productType === 'digital')),
    distinctUntilChanged(),
  );

  fetchProducts(query?: ProductQuery): Observable<Product[]> {
    this.setLoading(true);

    let params = new HttpParams();
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.categorySlug)
        params = params.set('categorySlug', query.categorySlug);
      if (query.productType)
        params = params.set('productType', query.productType);
      if (query.isFeatured !== undefined)
        params = params.set('isFeatured', query.isFeatured.toString());
      if (query.search) params = params.set('search', query.search);
    }

    return this.http
      .get<PaginatedResponse<Product>>(this.apiUrl, { params })
      .pipe(
        tap((response) => this.setData(response.data)),
        map((response) => response.data),
        catchError((error) => {
          this.setError(error.message || 'Failed to fetch products');
          return of([]);
        }),
      );
  }

  fetchFeatured(limit = 6): Observable<Product[]> {
    return this.fetchProducts({ isFeatured: true, limit });
  }

  fetchByCategory(categorySlug: string, limit?: number): Observable<Product[]> {
    return this.fetchProducts({ categorySlug, limit });
  }

  fetchByType(
    productType: 'saas' | 'digital' | 'physical',
    limit?: number,
  ): Observable<Product[]> {
    return this.fetchProducts({ productType, limit });
  }
}
