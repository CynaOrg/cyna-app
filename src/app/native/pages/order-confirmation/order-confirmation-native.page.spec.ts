import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { OrderApiService } from '@core/services/order-api.service';
import { AuthStore } from '@core/stores/auth.store';
import { Order } from '@core/interfaces';
import { OrderConfirmationNativePage } from './order-confirmation-native.page';

const apiOrder: Order = {
  id: 'o1',
  orderNumber: 'CYNA-1',
  userId: 'u1',
  guestEmail: null,
  items: [
    {
      id: 'i1',
      productId: 'p1',
      productSnapshot: { name: 'EDR', productType: 'saas' },
      quantity: 1,
      unitPrice: 49,
      totalPrice: 49,
    },
    {
      id: 'i2',
      productId: 'p2',
      productSnapshot: { name: 'Firewall', productType: 'physical' },
      quantity: 1,
      unitPrice: 199,
      totalPrice: 199,
    },
  ],
  subtotal: 248,
  total: 297.6,
  status: 'paid',
  billingAddressSnapshot: {},
  createdAt: '',
};

describe('OrderConfirmationNativePage', () => {
  let fixture: ComponentFixture<OrderConfirmationNativePage>;
  let component: OrderConfirmationNativePage;
  let orderApi: jasmine.SpyObj<OrderApiService>;
  let router: Router;
  let navigateByUrlSpy: jasmine.Spy;
  let auth: { isAuthenticated$: BehaviorSubject<boolean> };

  function setup(opts: {
    id?: string;
    state?: any;
    apiResponse?: Order | null;
  } = {}) {
    const id = opts.id ?? 'o1';
    orderApi = jasmine.createSpyObj<OrderApiService>('OrderApiService', [
      'getOrderById',
    ]);
    orderApi.getOrderById.and.returnValue(of(opts.apiResponse ?? apiOrder));

    auth = { isAuthenticated$: new BehaviorSubject(true) };

    TestBed.configureTestingModule({
      imports: [OrderConfirmationNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: OrderApiService, useValue: orderApi },
        { provide: AuthStore, useValue: auth },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    router = TestBed.inject(Router);
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');
    spyOn(router, 'getCurrentNavigation').and.returnValue({
      extras: { state: opts.state },
    } as any);

    fixture = TestBed.createComponent(OrderConfirmationNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('redirects to home when id is missing', () => {
    setup({ id: '' });
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/m/home');
  });

  it('builds order from navigation state without calling API', () => {
    setup({
      state: {
        orderNumber: 'CYNA-9',
        total: 100,
        items: [
          {
            productId: 'p1',
            quantity: 2,
            product: { nameFr: 'EDR', productType: 'saas', priceMonthly: 49 },
          },
        ],
      },
    });
    expect(orderApi.getOrderById).not.toHaveBeenCalled();
    expect(component.order()?.orderNumber).toBe('CYNA-9');
    expect(component.order()?.items[0].totalPrice).toBe(98);
    expect(component.hasSaas()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });

  it('falls back to fetching the order by id from the API', () => {
    setup();
    expect(orderApi.getOrderById).toHaveBeenCalledWith('o1');
    expect(component.order()?.orderNumber).toBe('CYNA-1');
    expect(component.hasSaas()).toBeTrue();
    expect(component.hasPhysical()).toBeTrue();
  });

  it('detects license items by name fallback', () => {
    const o: Order = {
      ...apiOrder,
      items: [
        {
          id: 'i',
          productId: 'p',
          productSnapshot: { name: 'License Pro' },
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    };
    setup({ apiResponse: o });
    expect(component.hasLicense()).toBeTrue();
  });
});
