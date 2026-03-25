import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CartStore } from './cart.store';
import { CartApiService } from '../services/cart-api.service';
import { AuthStore } from './auth.store';
import { CartResponse } from '../interfaces/cart.interface';

describe('CartStore', () => {
  let store: CartStore;
  let cartApiSpy: jasmine.SpyObj<CartApiService>;
  let isAuthenticated$: BehaviorSubject<boolean>;

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
        product: {
          nameFr: 'Produit 1',
          nameEn: 'Product 1',
          slug: 'product-1',
          productType: 'saas',
          priceMonthly: 49.99,
          priceYearly: 499.99,
          priceUnit: null,
          isAvailable: true,
          stockQuantity: null,
          images: [],
        },
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        quantity: 1,
        billingPeriod: 'yearly',
        product: {
          nameFr: 'Produit 2',
          nameEn: 'Product 2',
          slug: 'product-2',
          productType: 'physical',
          priceMonthly: null,
          priceYearly: null,
          priceUnit: 29.99,
          isAvailable: true,
          stockQuantity: 10,
          images: [],
        },
      },
    ],
    itemCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const emptyCart: CartResponse = {
    id: 'cart-2',
    userId: 'user-1',
    sessionId: null,
    items: [],
    itemCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    cartApiSpy = jasmine.createSpyObj('CartApiService', [
      'getCart',
      'addItem',
      'updateItem',
      'removeItem',
      'clearCart',
      'mergeGuestCart',
    ]);
    // Default: return empty to avoid triggering merge in constructor
    cartApiSpy.mergeGuestCart.and.returnValue(of(emptyCart));
    cartApiSpy.getCart.and.returnValue(of(emptyCart));

    isAuthenticated$ = new BehaviorSubject<boolean>(false);

    const authStoreMock = {
      isAuthenticated$: isAuthenticated$.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CartStore,
        { provide: CartApiService, useValue: cartApiSpy },
        { provide: AuthStore, useValue: authStoreMock },
      ],
    });

    store = TestBed.inject(CartStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should load cart', async () => {
    cartApiSpy.getCart.and.returnValue(of(mockCart));

    store.loadCart();

    const cart = await firstValueFrom(store.cart$);
    expect(cart).toEqual(mockCart);
  });

  it('should set loading state when loading cart', fakeAsync(() => {
    const loadingStates: boolean[] = [];
    store.isLoading$.subscribe((l) => loadingStates.push(l));

    cartApiSpy.getCart.and.returnValue(of(mockCart));
    store.loadCart();
    tick();

    // Should have gone: false (initial) -> true (loading) -> false (done)
    expect(loadingStates).toContain(true);
    expect(loadingStates[loadingStates.length - 1]).toBeFalse();
  }));

  it('should add item and update cart', async () => {
    cartApiSpy.addItem.and.returnValue(of(mockCart));

    store.addItem('prod-1', 2, 'monthly');

    const cart = await firstValueFrom(store.cart$);
    expect(cart).toEqual(mockCart);
    expect(cartApiSpy.addItem).toHaveBeenCalledWith({
      productId: 'prod-1',
      quantity: 2,
      billingPeriod: 'monthly',
    });
  });

  it('should update quantity', async () => {
    cartApiSpy.updateItem.and.returnValue(of(mockCart));

    store.updateQuantity('prod-1', 5, 'monthly');

    const cart = await firstValueFrom(store.cart$);
    expect(cart).toEqual(mockCart);
    expect(cartApiSpy.updateItem).toHaveBeenCalledWith('prod-1', 5, 'monthly');
  });

  it('should remove item', async () => {
    cartApiSpy.removeItem.and.returnValue(of(emptyCart));

    store.removeItem('prod-1', 'monthly');

    const cart = await firstValueFrom(store.cart$);
    expect(cart).toEqual(emptyCart);
    expect(cartApiSpy.removeItem).toHaveBeenCalledWith('prod-1', 'monthly');
  });

  it('should clear cart', async () => {
    // First populate the cart
    cartApiSpy.getCart.and.returnValue(of(mockCart));
    store.loadCart();

    cartApiSpy.clearCart.and.returnValue(of({ success: true }));
    store.clear();

    const cart = await firstValueFrom(store.cart$);
    expect(cart).toBeNull();
  });

  it('should compute count$ from items', async () => {
    cartApiSpy.getCart.and.returnValue(of(mockCart));
    store.loadCart();

    const count = await firstValueFrom(store.count$);
    // items: quantity 2 + quantity 1 = 3
    expect(count).toBe(3);
  });

  it('should compute isEmpty$ correctly when cart has items', async () => {
    cartApiSpy.getCart.and.returnValue(of(mockCart));
    store.loadCart();

    const isEmpty = await firstValueFrom(store.isEmpty$);
    expect(isEmpty).toBeFalse();
  });

  it('should compute isEmpty$ correctly when cart is empty', async () => {
    const isEmpty = await firstValueFrom(store.isEmpty$);
    expect(isEmpty).toBeTrue();
  });

  it('should handle error when loading cart fails', async () => {
    cartApiSpy.getCart.and.returnValue(
      throwError(() => ({ error: { message: 'Network error' } })),
    );

    store.loadCart();

    const error = await firstValueFrom(store.error$);
    expect(error).toBe('Network error');
  });

  it('should handle error when adding item fails', async () => {
    cartApiSpy.addItem.and.returnValue(
      throwError(() => ({ error: { message: 'Out of stock' } })),
    );

    store.addItem('prod-1');

    const error = await firstValueFrom(store.error$);
    expect(error).toBe('Out of stock');
  });

  it('should handle error when updating item fails', async () => {
    cartApiSpy.updateItem.and.returnValue(throwError(() => ({})));

    store.updateQuantity('prod-1', 99);

    const error = await firstValueFrom(store.error$);
    expect(error).toBe('Failed to update item');
  });

  it('should handle error when removing item fails', async () => {
    cartApiSpy.removeItem.and.returnValue(throwError(() => ({})));

    store.removeItem('prod-1');

    const error = await firstValueFrom(store.error$);
    expect(error).toBe('Failed to remove item');
  });
});
