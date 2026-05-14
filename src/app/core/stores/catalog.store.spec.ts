import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { CatalogStore } from './catalog.store';
import { ProductService } from '../services/product.service';
import { Product } from '../interfaces/product.interface';

const stubProduct = (id: string): Product =>
  ({
    id,
    slug: id,
    name: id,
    productType: 'saas',
    priceMonthly: 10,
    isAvailable: true,
    isFeatured: false,
  }) as Product;

describe('CatalogStore', () => {
  let store: CatalogStore;
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(() => {
    productService = jasmine.createSpyObj('ProductService', ['getProducts']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CatalogStore,
        { provide: ProductService, useValue: productService },
      ],
    });
    store = TestBed.inject(CatalogStore);
  });

  it('creates', () => {
    expect(store).toBeTruthy();
  });

  it('fetchPage publishes products and pagination on success', async () => {
    productService.getProducts.and.returnValue(
      of({
        data: [stubProduct('a'), stubProduct('b')],
        meta: { total: 2, page: 1, limit: 10 } as never,
      }),
    );
    const products = await firstValueFrom(store.fetchPage({}));
    expect(products.length).toBe(2);
    expect(await firstValueFrom(store.products$)).toEqual(products);
    expect(await firstValueFrom(store.isLoading$)).toBeFalse();
  });

  it('fetchPage surfaces server error message', fakeAsync(() => {
    productService.getProducts.and.returnValue(
      throwError(() => ({ message: 'down' })),
    );
    store.fetchPage({}).subscribe();
    tick();
    const errs: (string | null)[] = [];
    store.error$.subscribe((e) => errs.push(e));
    expect(errs[errs.length - 1]).toBe('down');
  }));

  it('fetchPage falls back to translation key on unknown error', fakeAsync(() => {
    productService.getProducts.and.returnValue(throwError(() => ({})));
    store.fetchPage({}).subscribe();
    tick();
    const errs: (string | null)[] = [];
    store.error$.subscribe((e) => errs.push(e));
    expect(errs[errs.length - 1]).toBeTruthy();
  }));

  it('reset() clears state', async () => {
    productService.getProducts.and.returnValue(
      of({
        data: [stubProduct('a')],
        meta: { total: 1, page: 1, limit: 10 } as never,
      }),
    );
    await firstValueFrom(store.fetchPage({}));
    store.reset();
    expect(await firstValueFrom(store.products$)).toEqual([]);
  });
});
