import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ProductService } from './product.service';
import { ApiService } from './api.service';
import {
  Product,
  ProductDetail,
  PaginatedResponse,
} from '../interfaces/product.interface';

describe('ProductService', () => {
  let service: ProductService;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let translateService: TranslateService;

  const mockProduct: Product = {
    id: '1',
    slug: 'test-product',
    name: 'Test Product',
    productType: 'saas',
    isAvailable: true,
    isFeatured: true,
  };

  const mockPaginatedResponse: PaginatedResponse<Product> = {
    data: [mockProduct],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  const mockProductDetail: ProductDetail = {
    ...mockProduct,
    description: 'Detailed description',
    characteristics: [{ key: 'feature', value: 'yes' }],
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', [
      'get',
      'getList',
      'getPaginated',
      'post',
      'put',
      'patch',
      'delete',
    ]);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [ProductService, { provide: ApiService, useValue: apiSpy }],
    });

    service = TestBed.inject(ProductService);
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('fr');
    translateService.use('fr');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products with default query', () => {
    apiSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

    service.getProducts().subscribe((response) => {
      expect(response).toEqual(mockPaginatedResponse);
    });

    expect(apiSpy.getPaginated).toHaveBeenCalledWith('catalog/products', {
      lang: 'fr',
    });
  });

  it('should fetch products with filters', () => {
    apiSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

    service
      .getProducts({
        categorySlug: 'soc',
        productType: 'saas',
        page: 2,
        limit: 5,
        isFeatured: true,
        search: 'edr',
      })
      .subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

    expect(apiSpy.getPaginated).toHaveBeenCalledWith('catalog/products', {
      lang: 'fr',
      categorySlug: 'soc',
      productType: 'saas',
      page: 2,
      limit: 5,
      isFeatured: true,
      search: 'edr',
    });
  });

  it('should fetch featured products', () => {
    apiSpy.getList.and.returnValue(of([mockProduct]));

    service.getFeaturedProducts(3).subscribe((products) => {
      expect(products).toEqual([mockProduct]);
    });

    expect(apiSpy.getList).toHaveBeenCalledWith('catalog/products/featured', {
      limit: 3,
      lang: 'fr',
    });
  });

  it('should fetch featured products with default limit', () => {
    apiSpy.getList.and.returnValue(of([mockProduct]));

    service.getFeaturedProducts().subscribe();

    expect(apiSpy.getList).toHaveBeenCalledWith('catalog/products/featured', {
      limit: 6,
      lang: 'fr',
    });
  });

  it('should fetch product by slug', () => {
    apiSpy.get.and.returnValue(of(mockProductDetail));

    service.getProductBySlug('test-product').subscribe((product) => {
      expect(product).toEqual(mockProductDetail);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('catalog/products/test-product', {
      lang: 'fr',
    });
  });

  it('should search products with term', () => {
    apiSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

    service
      .searchProducts('firewall', { page: 1, limit: 20 })
      .subscribe((response) => {
        expect(response).toEqual(mockPaginatedResponse);
      });

    expect(apiSpy.getPaginated).toHaveBeenCalledWith('catalog/search', {
      search: 'firewall',
      lang: 'fr',
      page: 1,
      limit: 20,
    });
  });

  it('should inject current language into requests', () => {
    translateService.use('en');
    apiSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

    service.getProducts().subscribe();

    expect(apiSpy.getPaginated).toHaveBeenCalledWith('catalog/products', {
      lang: 'en',
    });
  });
});
