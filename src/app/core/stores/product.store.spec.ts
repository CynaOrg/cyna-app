import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ProductStore } from './product.store';
import { ProductService } from '../services/product.service';
import {
  Product,
  ProductDetail,
  PaginatedResponse,
} from '../interfaces/product.interface';

describe('ProductStore', () => {
  let store: ProductStore;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProduct: Product = {
    id: '1',
    slug: 'edr-pro',
    name: 'EDR Pro',
    productType: 'saas',
    isAvailable: true,
    isFeatured: true,
    priceMonthly: 49.99,
  };

  const mockProduct2: Product = {
    id: '2',
    slug: 'firewall-x',
    name: 'Firewall X',
    productType: 'physical',
    isAvailable: true,
    isFeatured: false,
    priceUnit: 199.99,
  };

  const mockPaginatedResponse: PaginatedResponse<Product> = {
    data: [mockProduct, mockProduct2],
    meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
  };

  const mockProductDetail: ProductDetail = {
    ...mockProduct,
    description: 'Enterprise EDR solution',
    characteristics: [{ key: 'deployment', value: 'cloud' }],
  };

  beforeEach(() => {
    productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getProducts',
      'getFeaturedProducts',
      'getProductBySlug',
      'searchProducts',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProductStore,
        { provide: ProductService, useValue: productServiceSpy },
      ],
    });

    store = TestBed.inject(ProductStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should fetch products', async () => {
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResponse));

    const products = await firstValueFrom(store.fetchProducts());

    expect(products).toEqual([mockProduct, mockProduct2]);
    expect(productServiceSpy.getProducts).toHaveBeenCalledWith(undefined);
  });

  it('should fetch products with query', async () => {
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResponse));

    const query = { categorySlug: 'soc', limit: 5 };
    await firstValueFrom(store.fetchProducts(query));

    expect(productServiceSpy.getProducts).toHaveBeenCalledWith(query);
  });

  it('should update products$ observable after fetch', async () => {
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResponse));

    await firstValueFrom(store.fetchProducts());

    const products = await firstValueFrom(store.products$);
    expect(products.length).toBe(2);
  });

  it('should fetch featured products', async () => {
    productServiceSpy.getFeaturedProducts.and.returnValue(of([mockProduct]));

    const products = await firstValueFrom(store.fetchFeatured(3));

    expect(products).toEqual([mockProduct]);
    expect(productServiceSpy.getFeaturedProducts).toHaveBeenCalledWith(3);
  });

  it('should filter featured products from products$', async () => {
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResponse));

    await firstValueFrom(store.fetchProducts());

    const featured = await firstValueFrom(store.featured$);
    expect(featured.length).toBe(1);
    expect(featured[0].slug).toBe('edr-pro');
  });

  it('should fetch product by slug', async () => {
    productServiceSpy.getProductBySlug.and.returnValue(of(mockProductDetail));

    const product = await firstValueFrom(store.fetchProductBySlug('edr-pro'));

    expect(product).toEqual(mockProductDetail);
    expect(store.selectedProduct).toEqual(mockProductDetail);
  });

  it('should clear selected product before fetching by slug', () => {
    productServiceSpy.getProductBySlug.and.returnValue(of(mockProductDetail));

    // After calling fetchProductBySlug, selectedProduct is initially null
    // (reset at start), then set after response
    store.fetchProductBySlug('edr-pro').subscribe();
    expect(store.selectedProduct).toEqual(mockProductDetail);
  });

  it('should handle loading states', async () => {
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResponse));

    // Before fetch
    let isLoading = await firstValueFrom(store.isLoading$);
    expect(isLoading).toBeFalse();

    // After fetch completes, loading should be false
    await firstValueFrom(store.fetchProducts());
    isLoading = await firstValueFrom(store.isLoading$);
    expect(isLoading).toBeFalse();
  });

  it('should handle error when fetching products fails', async () => {
    productServiceSpy.getProducts.and.returnValue(
      throwError(() => ({ message: 'Server error' })),
    );

    const result = await firstValueFrom(store.fetchProducts());

    expect(result).toEqual([]);
    const error = await firstValueFrom(store.error$);
    expect(error).toBe('Server error');
  });

  it('should handle error when fetching product by slug fails', async () => {
    productServiceSpy.getProductBySlug.and.returnValue(
      throwError(() => ({ message: 'Not found' })),
    );

    await firstValueFrom(store.fetchProductBySlug('nonexistent'));

    const error = await firstValueFrom(store.error$);
    expect(error).toBe('Not found');
  });

  it('should store selected product in memory', async () => {
    productServiceSpy.getProductBySlug.and.returnValue(of(mockProductDetail));

    expect(store.selectedProduct).toBeNull();

    await firstValueFrom(store.fetchProductBySlug('edr-pro'));

    expect(store.selectedProduct).toEqual(mockProductDetail);
  });

  it('should filter saas products', async () => {
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResponse));
    await firstValueFrom(store.fetchProducts());

    const saas = await firstValueFrom(store.saasProducts$);
    expect(saas.length).toBe(1);
    expect(saas[0].productType).toBe('saas');
  });

  it('should filter physical products', async () => {
    productServiceSpy.getProducts.and.returnValue(of(mockPaginatedResponse));
    await firstValueFrom(store.fetchProducts());

    const physical = await firstValueFrom(store.physicalProducts$);
    expect(physical.length).toBe(1);
    expect(physical[0].productType).toBe('physical');
  });
});
