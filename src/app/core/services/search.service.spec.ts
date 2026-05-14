import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { firstValueFrom, of, throwError } from 'rxjs';
import { SearchService } from './search.service';
import { ProductService } from './product.service';
import { Product } from '../interfaces/product.interface';

const stubProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 'p1',
    slug: 'p1',
    name: 'Product 1',
    productType: 'saas',
    priceMonthly: 10,
    isAvailable: true,
    isFeatured: false,
    ...overrides,
  }) as Product;

describe('SearchService', () => {
  let service: SearchService;
  let productService: jasmine.SpyObj<ProductService>;
  let router: jasmine.SpyObj<Router>;
  let navCtrl: jasmine.SpyObj<NavController>;

  beforeEach(() => {
    productService = jasmine.createSpyObj('ProductService', ['getProducts']);
    router = jasmine.createSpyObj('Router', ['navigate'], { url: '/products' });
    navCtrl = jasmine.createSpyObj('NavController', [
      'navigateRoot',
      'navigateForward',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SearchService,
        { provide: ProductService, useValue: productService },
        { provide: Router, useValue: router },
        { provide: NavController, useValue: navCtrl },
      ],
    });
    service = TestBed.inject(SearchService);
  });

  it('creates closed by default', async () => {
    expect(await firstValueFrom(service.isOpen)).toBeFalse();
  });

  it('open() / close() / toggle() drive the isOpen subject', async () => {
    service.open();
    expect(await firstValueFrom(service.isOpen)).toBeTrue();
    service.close();
    expect(await firstValueFrom(service.isOpen)).toBeFalse();
    service.toggle();
    expect(await firstValueFrom(service.isOpen)).toBeTrue();
    service.toggle();
    expect(await firstValueFrom(service.isOpen)).toBeFalse();
  });

  it('addRecentSearch tracks unique terms (most recent first)', () => {
    service.addRecentSearch(' a ');
    service.addRecentSearch('b');
    service.addRecentSearch('a');
    expect(service.getRecentSearches()).toEqual(['a', 'b']);
  });

  it('addRecentSearch ignores empty/whitespace input', () => {
    service.addRecentSearch('   ');
    expect(service.getRecentSearches()).toEqual([]);
  });

  it('keeps at most 5 recent searches', () => {
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach((s) => service.addRecentSearch(s));
    expect(service.getRecentSearches().length).toBe(5);
    expect(service.getRecentSearches()[0]).toBe('f');
  });

  it('clearRecentSearches empties the list', () => {
    service.addRecentSearch('a');
    service.clearRecentSearches();
    expect(service.getRecentSearches()).toEqual([]);
  });

  it('selectResult navigates to /products/:slug for physical products', () => {
    service.selectResult(stubProduct({ productType: 'physical', slug: 'foo' }));
    expect(router.navigate).toHaveBeenCalledWith(['/products', 'foo']);
  });

  it('selectResult navigates to /services/:slug for saas', () => {
    service.selectResult(stubProduct({ productType: 'saas', slug: 'srv' }));
    expect(router.navigate).toHaveBeenCalledWith(['/services', 'srv']);
  });

  it('selectResult navigates to /licenses/:slug for license', () => {
    service.selectResult(stubProduct({ productType: 'license', slug: 'lic' }));
    expect(router.navigate).toHaveBeenCalledWith(['/licenses', 'lic']);
  });

  it('selectResult prefixes /dashboard when in dashboard area', () => {
    Object.defineProperty(router, 'url', {
      value: '/dashboard/foo',
      configurable: true,
    });
    service.selectResult(stubProduct({ productType: 'saas', slug: 'srv' }));
    expect(router.navigate).toHaveBeenCalledWith([
      '/dashboard/services',
      'srv',
    ]);
  });

  it('setFilter updates filter$', async () => {
    service.setFilter('saas');
    expect(await firstValueFrom(service.filter$)).toBe('saas');
  });

  it('groupedResults$ groups products by productType', fakeAsync(() => {
    productService.getProducts.and.returnValue(
      of({
        data: [
          stubProduct({ id: 'a', productType: 'saas' }),
          stubProduct({ id: 'b', productType: 'physical' }),
          stubProduct({ id: 'c', productType: 'physical' }),
        ],
        meta: { total: 3, page: 1, limit: 20 },
      }) as never,
    );
    service.open();
    service.search('foo');
    tick(400);
    const all: unknown[][] = [];
    service.groupedResults$.subscribe((g) => all.push(g));
    expect(all[all.length - 1].length).toBeGreaterThan(0);
  }));

  it('search() sets error state when API fails', fakeAsync(() => {
    productService.getProducts.and.returnValue(
      throwError(() => new Error('x')),
    );
    service.open();
    service.search('foo');
    tick(400);
    const errs: (string | null)[] = [];
    service.error$.subscribe((e) => errs.push(e));
    expect(errs[errs.length - 1]).toBe('SEARCH.ERROR');
  }));

  it('search() resets state when term is empty', fakeAsync(() => {
    service.open();
    service.search('');
    tick(400);
    let hasSearched = true;
    service.hasSearched$.subscribe((h) => (hasSearched = h));
    expect(hasSearched).toBeFalse();
  }));
});
