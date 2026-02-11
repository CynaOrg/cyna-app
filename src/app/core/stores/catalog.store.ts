import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  distinctUntilChanged,
} from 'rxjs';
import {
  Product,
  ProductQuery,
  PaginatedMeta,
} from '../interfaces/product.interface';
import { ProductService } from '../services/product.service';

export interface CatalogState {
  products: Product[];
  pagination: PaginatedMeta | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  products: [],
  pagination: null,
  isLoading: false,
  error: null,
};

@Injectable()
export class CatalogStore {
  private readonly productService = inject(ProductService);
  private readonly state$ = new BehaviorSubject<CatalogState>(initialState);

  readonly products$: Observable<Product[]> = this.state$.pipe(
    map((s) => s.products),
    distinctUntilChanged(),
  );

  readonly pagination$: Observable<PaginatedMeta | null> = this.state$.pipe(
    map((s) => s.pagination),
    distinctUntilChanged(),
  );

  readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map((s) => s.isLoading),
    distinctUntilChanged(),
  );

  readonly error$: Observable<string | null> = this.state$.pipe(
    map((s) => s.error),
    distinctUntilChanged(),
  );

  fetchPage(query: ProductQuery): Observable<Product[]> {
    this.state$.next({
      products: [],
      pagination: null,
      isLoading: true,
      error: null,
    });

    return this.productService.getProducts(query).pipe(
      tap((response) => {
        this.state$.next({
          products: response.data,
          pagination: response.meta,
          isLoading: false,
          error: null,
        });
      }),
      map((response) => response.data),
      catchError((err) => {
        this.state$.next({
          ...this.state$.getValue(),
          isLoading: false,
          error: err.message || 'Failed to fetch products',
        });
        return of([]);
      }),
    );
  }

  reset(): void {
    this.state$.next(initialState);
  }
}
