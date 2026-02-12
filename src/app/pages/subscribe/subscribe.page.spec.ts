import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SubscribePage } from './subscribe.page';
import { ProductStore } from '@core/stores/product.store';
import { SubscriptionApiService } from '@core/services/subscription-api.service';
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';

const mockSaasProduct = {
  id: 'prod-1',
  name: 'SOC Service',
  slug: 'soc-service',
  productType: 'saas',
  priceMonthly: 99,
  priceYearly: 990,
  shortDescription: 'A test SOC service',
  isAvailable: true,
};

describe('SubscribePage', () => {
  let component: SubscribePage;
  let fixture: ComponentFixture<SubscribePage>;
  let router: Router;
  let mockSubscriptionApi: jasmine.SpyObj<SubscriptionApiService>;

  const mockProductStore = {
    fetchProductBySlug: jasmine
      .createSpy('fetchProductBySlug')
      .and.returnValue(of(mockSaasProduct)),
  };

  beforeEach(async () => {
    mockSubscriptionApi = jasmine.createSpyObj('SubscriptionApiService', [
      'createSubscription',
    ]);
    mockSubscriptionApi.createSubscription.and.returnValue(
      of({ clientSecret: 'cs_test_123', subscriptionId: 'sub_123' }),
    );

    await TestBed.configureTestingModule({
      declarations: [SubscribePage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        NgIconComponent,
        AddressFormComponent,
      ],
      providers: [
        { provide: ProductStore, useValue: mockProductStore },
        { provide: SubscriptionApiService, useValue: mockSubscriptionApi },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'soc-service' } },
          },
        },
        provideIcons({ phosphorArrowLeft }),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SubscribePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the product on init', () => {
    expect(mockProductStore.fetchProductBySlug).toHaveBeenCalledWith(
      'soc-service',
    );
    expect(component.product()).toEqual(mockSaasProduct as any);
    expect(component.isLoadingProduct()).toBeFalse();
  });

  it('should default to monthly billing', () => {
    expect(component.billingPeriod()).toBe('monthly');
  });

  it('should toggle billing period', () => {
    component.toggleBillingPeriod('yearly');
    expect(component.billingPeriod()).toBe('yearly');
  });

  it('should calculate current price based on billing period', () => {
    expect(component.currentPrice).toBe(99);
    component.toggleBillingPeriod('yearly');
    expect(component.currentPrice).toBe(990);
  });

  it('should calculate savings percentage', () => {
    const savings = component.savingsPercent;
    // yearly monthly = 990 / 12 = 82.5 vs 99 monthly
    // savings = (1 - 82.5/99) * 100 = ~17%
    expect(savings).toBeGreaterThan(0);
    expect(savings).toBeLessThan(100);
  });

  it('should handle billing address change', () => {
    const address = {
      street: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
      state: '',
    };
    component.onBillingAddressChange(address);
    expect(component.billingAddress).toEqual(address);
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

  it('should handle subscription creation API error', () => {
    mockSubscriptionApi.createSubscription.and.returnValue(
      throwError(() => ({
        error: { message: 'Insufficient funds' },
      })),
    );

    component.billingAddress = {
      street: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
      state: '',
    };

    // Mock the billing form validity
    component.billingForm = { isValid: () => true } as any;

    component.createSubscription();

    expect(component.error()).toBe('Insufficient funds');
    expect(component.isCreating()).toBeFalse();
  });
});
