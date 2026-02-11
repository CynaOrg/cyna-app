import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';

import { CheckoutPage } from './checkout.page';
import { CartStore } from '@core/stores/cart.store';
import { CheckoutStore } from '@core/stores/checkout.store';
import { AuthStore } from '@core/stores/auth.store';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';

describe('CheckoutPage', () => {
  let component: CheckoutPage;
  let fixture: ComponentFixture<CheckoutPage>;
  let router: Router;

  const mockCartStore = {
    items$: new BehaviorSubject([
      {
        id: '1',
        quantity: 1,
        product: {
          id: 'p1',
          name: 'Test Product',
          productType: 'physical',
          price: 99,
        },
      },
    ]),
    total$: new BehaviorSubject(99),
    isEmpty$: new BehaviorSubject(false),
    cart$: new BehaviorSubject({ id: 'cart-1', items: [] }),
    count$: new BehaviorSubject(1),
  };

  const mockCheckoutStore = {
    clientSecret$: new BehaviorSubject<string | null>(null),
    isLoading$: new BehaviorSubject(false),
    error$: new BehaviorSubject<string | null>(null),
    state: {
      email: '',
      billingAddress: null,
      shippingAddress: null,
      clientSecret: null,
      paymentIntentId: 'pi_test123',
      isLoading: false,
      error: null,
    },
    setEmail: jasmine.createSpy('setEmail'),
    setBillingAddress: jasmine.createSpy('setBillingAddress'),
    setShippingAddress: jasmine.createSpy('setShippingAddress'),
    createPaymentIntent: jasmine.createSpy('createPaymentIntent'),
    reset: jasmine.createSpy('reset'),
  };

  const mockAuthStore = {
    user$: new BehaviorSubject({
      id: 'u1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
    }),
    isAuthenticated$: new BehaviorSubject(true),
    token$: new BehaviorSubject('token'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        NgIconComponent,
        AddressFormComponent,
        OrderSummaryComponent,
      ],
      providers: [
        { provide: CartStore, useValue: mockCartStore },
        { provide: CheckoutStore, useValue: mockCheckoutStore },
        { provide: AuthStore, useValue: mockAuthStore },
        provideIcons({ phosphorArrowLeft }),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CheckoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pre-fill email from authenticated user', () => {
    expect(component.email).toBe('test@test.com');
    expect(mockCheckoutStore.setEmail).toHaveBeenCalledWith('test@test.com');
  });

  it('should detect physical items in cart', () => {
    expect(component.hasPhysicalItems()).toBeTrue();
  });

  it('should update email on input change', () => {
    const event = { target: { value: 'new@email.com' } } as any;
    component.onEmailChange(event);
    expect(component.email).toBe('new@email.com');
    expect(mockCheckoutStore.setEmail).toHaveBeenCalledWith('new@email.com');
  });

  it('should update billing address', () => {
    const address = {
      street: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
      state: '',
    };
    component.onBillingAddressChange(address);
    expect(mockCheckoutStore.setBillingAddress).toHaveBeenCalledWith(address);
  });

  it('should set paymentReady on payment ready event', () => {
    component.onPaymentReady();
    expect(component.paymentReady).toBeTrue();
  });

  it('should handle payment error', () => {
    component.onPaymentError('Card declined');
    expect(component.paymentReady).toBeFalse();
    expect(component.paymentError).toBe('Card declined');
  });

  it('should not create payment intent without email', () => {
    component.email = '';
    component.createPaymentIntent();
    expect(mockCheckoutStore.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('should redirect to cart if cart is empty', () => {
    spyOn(router, 'navigate');
    mockCartStore.isEmpty$.next(true);

    const newFixture = TestBed.createComponent(CheckoutPage);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/cart']);
  });
});
