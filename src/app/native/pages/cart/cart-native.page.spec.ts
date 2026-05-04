import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CartStore } from '@core/stores/cart.store';
import {
  CartItemResponse,
  CartProductInfo,
} from '@core/interfaces/cart.interface';
import { CartNativePage } from './cart-native.page';

function makeItem(
  id: string,
  type: 'saas' | 'physical' | 'license',
  qty = 1,
  price = 10,
): CartItemResponse {
  const product: CartProductInfo = {
    nameFr: id,
    nameEn: id,
    slug: id,
    productType: type,
    priceMonthly: type === 'saas' ? price : null,
    priceYearly: null,
    priceUnit: type === 'saas' ? null : price,
    isAvailable: true,
    stockQuantity: 99,
    images: [],
  };
  return { id, productId: id, quantity: qty, billingPeriod: 'monthly', product };
}

describe('CartNativePage', () => {
  let fixture: ComponentFixture<CartNativePage>;
  let component: CartNativePage;
  let cartStore: jasmine.SpyObj<CartStore> & {
    items$: BehaviorSubject<CartItemResponse[]>;
    count$: BehaviorSubject<number>;
    total$: BehaviorSubject<number>;
    isEmpty$: BehaviorSubject<boolean>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
  };
  let router: Router;
  let navigateByUrlSpy: jasmine.Spy;

  beforeEach(async () => {
    cartStore = {
      items$: new BehaviorSubject<CartItemResponse[]>([]),
      count$: new BehaviorSubject<number>(0),
      total$: new BehaviorSubject<number>(0),
      isEmpty$: new BehaviorSubject<boolean>(true),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      loadCart: jasmine.createSpy('loadCart'),
      updateQuantity: jasmine.createSpy('updateQuantity'),
      removeItem: jasmine.createSpy('removeItem'),
      clear: jasmine.createSpy('clear'),
    } as unknown as typeof cartStore;

    await TestBed.configureTestingModule({
      imports: [CartNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: cartStore },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');

    fixture = TestBed.createComponent(CartNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and triggers a cart load on init', () => {
    expect(component).toBeTruthy();
    expect(cartStore.loadCart).toHaveBeenCalled();
  });

  it('splits recurring vs one-time items and detects mixed cart', () => {
    const saas = makeItem('a', 'saas', 1, 20);
    const physical = makeItem('b', 'physical', 2, 30);
    cartStore.items$.next([saas, physical]);
    fixture.detectChanges();

    expect(component.recurringItems().length).toBe(1);
    expect(component.oneTimeItems().length).toBe(1);
    expect(component.recurringTotal()).toBe(20);
    expect(component.oneTimeTotal()).toBe(60);
    expect(component.isMixed()).toBeTrue();
  });

  it('does not flag mixed when only one type is present', () => {
    cartStore.items$.next([makeItem('a', 'physical', 1, 5)]);
    fixture.detectChanges();
    expect(component.isMixed()).toBeFalse();
  });

  it('forwards quantity, removal and clear actions to the store', () => {
    const item = makeItem('a', 'physical', 2, 10);
    cartStore.items$.next([item]);
    fixture.detectChanges();

    component.increment(item);
    expect(cartStore.updateQuantity).toHaveBeenCalledWith('a', 3);

    component.decrement(item);
    expect(cartStore.updateQuantity).toHaveBeenCalledWith('a', 1);

    component.remove(item);
    expect(cartStore.removeItem).toHaveBeenCalledWith('a');

    component.clearCart();
    expect(cartStore.clear).toHaveBeenCalled();
  });

  it('does not decrement below 1', () => {
    const item = makeItem('a', 'physical', 1, 10);
    component.decrement(item);
    expect(cartStore.updateQuantity).not.toHaveBeenCalled();
  });

  it('navigates to checkout when CTA is invoked', () => {
    component.goToCheckout();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/m/checkout');
  });

  it('triggers a reload when refreshing', () => {
    cartStore.loadCart.calls.reset();
    component.onRefresh();
    expect(cartStore.loadCart).toHaveBeenCalled();
  });
});
