import { Injectable, inject } from '@angular/core';
import {
  Observable,
  map,
  distinctUntilChanged,
  catchError,
  of,
  tap,
} from 'rxjs';
import { BaseStore } from './base.store';
import {
  Product,
  ProductDetail,
  ProductQuery,
} from '../interfaces/product.interface';
import { ProductService } from '../services/product.service';
import { PreferencesService } from '../services/preferences.service';

const PRODUCTS_CACHE_KEY = 'cached_products';

@Injectable({
  providedIn: 'root',
})
export class ProductStore extends BaseStore<Product[]> {
  private readonly productService = inject(ProductService);
  private readonly preferences = inject(PreferencesService);

  private _selectedProduct: ProductDetail | null = null;
  private _similarProducts: Product[] = [];

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

  readonly licenseProducts$: Observable<Product[]> = this.products$.pipe(
    map((products) => products.filter((p) => p.productType === 'license')),
    distinctUntilChanged(),
  );

  get selectedProduct(): ProductDetail | null {
    return this._selectedProduct;
  }

  get similarProducts(): Product[] {
    return this._similarProducts;
  }

  fetchProducts(query?: ProductQuery): Observable<Product[]> {
    this.setLoading(true);

    return this.productService.getProducts(query).pipe(
      tap((response) => {
        this.setData(response.data);
        void this.cacheProducts(response.data);
      }),
      map((response) => response.data),
      catchError((error) => {
        this.setError(error.message || 'Failed to fetch products');
        return of([]);
      }),
    );
  }

  fetchFeatured(limit = 6): Observable<Product[]> {
    this.setLoading(true);

    return this.productService.getFeaturedProducts(limit).pipe(
      tap((products) => {
        this.setData(products);
        void this.cacheProducts(products);
      }),
      catchError((error) => {
        this.setError(error.message || 'Failed to fetch featured products');
        return of([]);
      }),
    );
  }

  /**
   * Restore the last persisted product list from `@capacitor/preferences`.
   * Only applied when the store currently holds nothing — a live fetch
   * always wins. Called once at boot via `AppComponent`.
   */
  async hydrateFromCache(): Promise<void> {
    if (this.state.data && this.state.data.length > 0) {
      return;
    }
    try {
      const cached = await this.preferences.get<Product[]>(PRODUCTS_CACHE_KEY);
      if (cached && cached.length > 0) {
        this.setData(cached);
      }
    } catch {
      // Preferences unavailable — skip silently.
    }
  }

  private async cacheProducts(products: Product[]): Promise<void> {
    try {
      await this.preferences.set(PRODUCTS_CACHE_KEY, products);
    } catch {
      // Persistence is best-effort.
    }
  }

  fetchByCategory(categorySlug: string, limit?: number): Observable<Product[]> {
    return this.fetchProducts({ categorySlug, limit });
  }

  fetchByType(
    productType: 'saas' | 'physical' | 'license',
    limit?: number,
  ): Observable<Product[]> {
    return this.fetchProducts({ productType, limit });
  }

  fetchProductBySlug(slug: string): Observable<ProductDetail> {
    this.setLoading(true);
    this._selectedProduct = null;

    return this.productService.getProductBySlug(slug).pipe(
      tap((product) => {
        this._selectedProduct = product;
        this.setLoading(false);
      }),
      catchError((error) => {
        this.setError(error.message || 'Failed to fetch product');
        return of(null as unknown as ProductDetail);
      }),
    );
  }

  fetchSimilarProducts(
    productType: string,
    excludeSlug: string,
  ): Observable<Product[]> {
    return this.productService
      .getProducts({
        productType: productType as Product['productType'],
        limit: 6,
      })
      .pipe(
        map((response) => response.data.filter((p) => p.slug !== excludeSlug)),
        tap((products) => {
          this._similarProducts = products;
        }),
        catchError(() => {
          this._similarProducts = [];
          return of([]);
        }),
      );
  }
}
