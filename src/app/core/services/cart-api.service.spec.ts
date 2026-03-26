import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CartApiService } from './cart-api.service';
import { ApiService } from './api.service';
import { CartResponse } from '../interfaces/cart.interface';

describe('CartApiService', () => {
  let service: CartApiService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockCart: CartResponse = {
    id: 'cart-1',
    userId: 'user-1',
    sessionId: null,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 2,
        billingPeriod: 'monthly',
        product: null,
      },
    ],
    itemCount: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', [
      'get',
      'post',
      'patch',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [CartApiService, { provide: ApiService, useValue: apiSpy }],
    });

    service = TestBed.inject(CartApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get cart', () => {
    apiSpy.get.and.returnValue(of(mockCart));

    service.getCart().subscribe((cart) => {
      expect(cart).toEqual(mockCart);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('cart');
  });

  it('should add item to cart', () => {
    apiSpy.post.and.returnValue(of(mockCart));
    const dto = { productId: 'prod-1', quantity: 1, billingPeriod: 'monthly' };

    service.addItem(dto).subscribe((cart) => {
      expect(cart).toEqual(mockCart);
    });

    expect(apiSpy.post).toHaveBeenCalledWith('cart/items', dto);
  });

  it('should update item quantity', () => {
    apiSpy.patch.and.returnValue(of(mockCart));

    service.updateItem('prod-1', 3).subscribe((cart) => {
      expect(cart).toEqual(mockCart);
    });

    expect(apiSpy.patch).toHaveBeenCalledWith('cart/items/prod-1', {
      quantity: 3,
    });
  });

  it('should update item quantity with billing period', () => {
    apiSpy.patch.and.returnValue(of(mockCart));

    service.updateItem('prod-1', 3, 'yearly').subscribe((cart) => {
      expect(cart).toEqual(mockCart);
    });

    expect(apiSpy.patch).toHaveBeenCalledWith(
      'cart/items/prod-1?billingPeriod=yearly',
      { quantity: 3 },
    );
  });

  it('should remove item from cart', () => {
    apiSpy.delete.and.returnValue(of(mockCart));

    service.removeItem('prod-1').subscribe((cart) => {
      expect(cart).toEqual(mockCart);
    });

    expect(apiSpy.delete).toHaveBeenCalledWith('cart/items/prod-1');
  });

  it('should remove item with billing period', () => {
    apiSpy.delete.and.returnValue(of(mockCart));

    service.removeItem('prod-1', 'monthly').subscribe((cart) => {
      expect(cart).toEqual(mockCart);
    });

    expect(apiSpy.delete).toHaveBeenCalledWith(
      'cart/items/prod-1?billingPeriod=monthly',
    );
  });

  it('should clear cart', () => {
    apiSpy.delete.and.returnValue(of({ success: true }));

    service.clearCart().subscribe((result) => {
      expect(result).toEqual({ success: true });
    });

    expect(apiSpy.delete).toHaveBeenCalledWith('cart');
  });

  it('should merge guest cart', () => {
    apiSpy.post.and.returnValue(of(mockCart));

    service.mergeGuestCart().subscribe((cart) => {
      expect(cart).toEqual(mockCart);
    });

    expect(apiSpy.post).toHaveBeenCalledWith('cart/merge', {});
  });
});
