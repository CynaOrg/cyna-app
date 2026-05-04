import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/stores/auth.store';
import { CartStore } from '@core/stores/cart.store';
import { CheckoutStore } from '@core/stores/checkout.store';
import {
  CartItemResponse,
  CartProductInfo,
  CartResponse,
} from '@core/interfaces/cart.interface';
import { CheckoutNativePage } from './checkout-native.page';

function physical(id: string): CartItemResponse {
  const product: CartProductInfo = {
    nameFr: id,
    nameEn: id,
    slug: id,
    productType: 'physical',
    priceMonthly: null,
    priceYearly: null,
    priceUnit: 25,
    isAvailable: true,
    stockQuantity: 10,
    images: [],
  };
  return { id, productId: id, quantity: 1, billingPeriod: '', product };
}

function saas(id: string): CartItemResponse {
  const product: CartProductInfo = {
    nameFr: id,
    nameEn: id,
    slug: id,
    productType: 'saas',
    priceMonthly: 49,
    priceYearly: null,
    priceUnit: null,
    isAvailable: true,
    stockQuantity: null,
    images: [],
  };
  return { id, productId: id, quantity: 1, billingPeriod: 'monthly', product };
}

describe('CheckoutNativePage', () => {
  let fixture: ComponentFixture<CheckoutNativePage>;
  let component: CheckoutNativePage;
  let cartStore: jasmine.SpyObj<CartStore> & {
    items$: BehaviorSubject<CartItemResponse[]>;
    total$: BehaviorSubject<number>;
    cart$: BehaviorSubject<CartResponse | null>;
    isEmpty$: BehaviorSubject<boolean>;
  };
  let checkoutStore: jasmine.SpyObj<CheckoutStore> & {
    clientSecret$: BehaviorSubject<string | null>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    state: { orderId: string | null; orderNumber: string | null; paymentIntentId: string | null };
  };
  let authStore: {
    user$: BehaviorSubject<{ email?: string } | null>;
    isAuthenticated$: BehaviorSubject<boolean>;
  };
  let router: Router;
  let navigateSpy: jasmine.Spy;
  let navigateByUrlSpy: jasmine.Spy;

  beforeEach(async () => {
    cartStore = {
      items$: new BehaviorSubject<CartItemResponse[]>([saas('a')]),
      total$: new BehaviorSubject<number>(49),
      cart$: new BehaviorSubject<CartResponse | null>({
        id: 'c1',
        userId: null,
        sessionId: 's',
        items: [],
        itemCount: 0,
        createdAt: '',
        updatedAt: '',
      }),
      isEmpty$: new BehaviorSubject<boolean>(false),
      clear: jasmine.createSpy('clear'),
    } as unknown as typeof cartStore;

    checkoutStore = {
      clientSecret$: new BehaviorSubject<string | null>(null),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      state: { orderId: 'o1', orderNumber: 'CYNA-1', paymentIntentId: 'pi_1' },
      setEmail: jasmine.createSpy('setEmail'),
      setBillingAddress: jasmine.createSpy('setBillingAddress'),
      setShippingAddress: jasmine.createSpy('setShippingAddress'),
      createPaymentIntent: jasmine.createSpy('createPaymentIntent'),
      reset: jasmine.createSpy('reset'),
    } as unknown as typeof checkoutStore;

    authStore = {
      user$: new BehaviorSubject<{ email?: string } | null>(null),
      isAuthenticated$: new BehaviorSubject<boolean>(false),
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: cartStore },
        { provide: AuthStore, useValue: authStore },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(CheckoutNativePage, {
        set: { providers: [{ provide: CheckoutStore, useValue: checkoutStore }] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');
    navigateSpy = spyOn(router, 'navigate');

    fixture = TestBed.createComponent(CheckoutNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and starts on the auth step for guest', () => {
    expect(component).toBeTruthy();
    expect(component.currentStep()).toBe('auth');
  });

  it('redirects to cart when the cart is empty', () => {
    cartStore.isEmpty$.next(true);
    const f = TestBed.createComponent(CheckoutNativePage);
    f.detectChanges();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/m/cart');
  });

  it('continues as guest after providing a valid email', () => {
    component.emailForm.setValue({ email: 'a@b.io' });
    component.continueAsGuest();
    expect(checkoutStore.setEmail).toHaveBeenCalledWith('a@b.io');
    expect(component.currentStep()).toBe('billing');
  });

  it('blocks guest continuation on invalid email', () => {
    component.emailForm.setValue({ email: 'not-an-email' });
    component.continueAsGuest();
    expect(checkoutStore.setEmail).not.toHaveBeenCalled();
    expect(component.currentStep()).toBe('auth');
  });

  it('skips shipping when no physical items and creates payment intent', () => {
    component.emailForm.setValue({ email: 'a@b.io' });
    component.continueAsGuest();
    component.billingForm.setValue({
      street: '1 rue',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
      state: '',
    });
    component.submitBilling();
    expect(component.currentStep()).toBe('payment');
    expect(checkoutStore.createPaymentIntent).toHaveBeenCalledWith('c1');
  });

  it('routes to shipping when cart has physical items', () => {
    cartStore.items$.next([physical('p')]);
    fixture.detectChanges();
    component.emailForm.setValue({ email: 'a@b.io' });
    component.continueAsGuest();
    component.billingForm.setValue({
      street: '1 rue',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
      state: '',
    });
    component.submitBilling();
    expect(component.currentStep()).toBe('shipping');
  });

  it('redirects to login with returnUrl', () => {
    component.goToLogin();
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/m/auth/login'],
      jasmine.objectContaining({
        queryParams: { returnUrl: '/m/checkout' },
      }),
    );
  });

  it('computes total in cents for the wallet button', () => {
    cartStore.total$.next(100);
    fixture.detectChanges();
    expect(component.totalCents()).toBe(12000);
  });
});
