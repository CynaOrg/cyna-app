import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@core/stores/product.store';
import { SubscriptionApiService } from '@core/services/subscription-api.service';
import { ProductDetail } from '@core/interfaces';
import { SubscribeNativePage } from './subscribe-native.page';

const saasProduct: ProductDetail = {
  id: 'p1',
  slug: 'edr-pro',
  name: 'EDR Pro',
  description: 'desc',
  shortDescription: 'short',
  productType: 'saas',
  priceMonthly: 49,
  priceYearly: 490,
  isAvailable: true,
  isFeatured: false,
};

const physicalProduct: ProductDetail = {
  ...saasProduct,
  id: 'p2',
  slug: 'firewall',
  productType: 'physical',
  priceMonthly: undefined,
  priceUnit: 199,
};

describe('SubscribeNativePage', () => {
  let fixture: ComponentFixture<SubscribeNativePage>;
  let component: SubscribeNativePage;
  let productStore: jasmine.SpyObj<ProductStore>;
  let subApi: jasmine.SpyObj<SubscriptionApiService>;
  let router: Router;
  let navigateSpy: jasmine.Spy;
  let navigateByUrlSpy: jasmine.Spy;

  function setup(slug: string, product: ProductDetail | null = saasProduct) {
    productStore = jasmine.createSpyObj<ProductStore>('ProductStore', [
      'fetchProductBySlug',
    ]);
    productStore.fetchProductBySlug.and.returnValue(
      of(product as ProductDetail),
    );
    subApi = jasmine.createSpyObj<SubscriptionApiService>(
      'SubscriptionApiService',
      ['createSubscription'],
    );
    subApi.createSubscription.and.returnValue(
      of({ subscriptionId: 's1', clientSecret: 'cs_test' } as any),
    );
    TestBed.configureTestingModule({
      imports: [SubscribeNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ProductStore, useValue: productStore },
        { provide: SubscriptionApiService, useValue: subApi },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ slug }) } },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');

    fixture = TestBed.createComponent(SubscribeNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads a SaaS product and exposes monthly price by default', () => {
    setup('edr-pro');
    expect(component.product()).toEqual(saasProduct);
    expect(component.billingPeriod()).toBe('monthly');
    expect(component.currentPrice()).toBe(49);
  });

  it('redirects to product detail if product is not SaaS', () => {
    setup('firewall', physicalProduct);
    expect(navigateSpy).toHaveBeenCalledWith(['/m/products', 'firewall']);
  });

  it('redirects to home when slug is missing', () => {
    setup('', saasProduct);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/m/home');
  });

  it('toggles billing period and recomputes price', () => {
    setup('edr-pro');
    component.toggleBillingPeriod('yearly');
    expect(component.currentPrice()).toBe(490);
    expect(component.savingsPercent()).toBeGreaterThan(0);
  });

  it('blocks subscription creation when address is invalid', () => {
    setup('edr-pro');
    component.createSubscription();
    expect(subApi.createSubscription).not.toHaveBeenCalled();
    expect(component.error()).toBeTruthy();
  });

  it('creates subscription with valid address and exposes clientSecret', () => {
    setup('edr-pro');
    component.billingForm.setValue({
      street: '1 rue',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    });
    component.createSubscription();
    expect(subApi.createSubscription).toHaveBeenCalled();
    expect(component.clientSecret()).toBe('cs_test');
  });

  it('captures error from the API', () => {
    setup('edr-pro');
    subApi.createSubscription.and.returnValue(
      throwError(() => ({ error: { message: 'Boom' } })),
    );
    component.billingForm.setValue({
      street: '1 rue',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    });
    component.createSubscription();
    expect(component.error()).toBe('Boom');
  });

  it('computes amount in cents (TTC) for the wallet button', () => {
    setup('edr-pro');
    expect(component.totalCents()).toBe(Math.round(49 * 1.2 * 100));
  });
});
