import { Injectable, inject } from '@angular/core';
import {
  Observable,
  map,
  distinctUntilChanged,
  catchError,
  of,
  tap,
  firstValueFrom,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BaseStore } from './base.store';
import {
  Product,
  ProductDetail,
  ProductQuery,
} from '../interfaces/product.interface';
import { ProductService } from '../services/product.service';

@Injectable({
  providedIn: 'root',
})
export class ProductStore extends BaseStore<Product[]> {
  private readonly productService = inject(ProductService);
  private readonly translate = inject(TranslateService);

  private _selectedProduct: ProductDetail | null = null;
  private _similarProducts: Product[] = [];

  private setTranslatedError(
    serverMessage: string | undefined,
    fallbackKey: string,
  ): void {
    if (serverMessage) {
      this.setError(serverMessage);
    } else {
      firstValueFrom(this.translate.get(fallbackKey)).then((msg) =>
        this.setError(msg),
      );
    }
  }

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
      tap((response) => this.setData(response.data)),
      map((response) => response.data),
      catchError((error) => {
        this.setTranslatedError(error?.message, 'PRODUCT_LIST.FETCH_ERROR');
        return of([]);
      }),
    );
  }

  fetchFeatured(limit = 6): Observable<Product[]> {
    this.setLoading(true);

    return this.productService.getFeaturedProducts(limit).pipe(
      tap((products) => this.setData(products)),
      catchError((error) => {
        this.setTranslatedError(
          error?.message,
          'PRODUCT_LIST.FETCH_FEATURED_ERROR',
        );
        return of([]);
      }),
    );
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
        this.setTranslatedError(error?.message, 'PRODUCT_LIST.FETCH_ONE_ERROR');
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
        limit: 5,
      })
      .pipe(
        map((response) =>
          response.data.filter((p) => p.slug !== excludeSlug).slice(0, 4),
        ),
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
