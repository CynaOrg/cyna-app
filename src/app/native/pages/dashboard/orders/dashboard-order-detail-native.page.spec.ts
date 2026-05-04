import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { OrderApiService } from '@core/services/order-api.service';
import { Order } from '@core/interfaces/order.interface';
import { DashboardOrderDetailNativePage } from './dashboard-order-detail-native.page';

const order: Order = {
  id: 'o1',
  orderNumber: 'CMD-1',
  userId: 'u',
  guestEmail: null,
  items: [
    {
      id: 'i1',
      productId: 'p1',
      productSnapshot: { name: 'SOC' },
      quantity: 1,
      unitPrice: 100,
      totalPrice: 100,
    },
  ],
  subtotal: 100,
  total: 120,
  status: 'paid',
  billingAddressSnapshot: { street: '1 rue', city: 'Paris' },
  createdAt: '2026-04-01T00:00:00Z',
};

function configure(
  apiSpy: jasmine.Spy,
  paramId: string | null,
): Promise<ComponentFixture<DashboardOrderDetailNativePage>> {
  const route = {
    snapshot: { paramMap: { get: () => paramId } },
  } as unknown as ActivatedRoute;

  return TestBed.configureTestingModule({
    imports: [DashboardOrderDetailNativePage, TranslateModule.forRoot()],
    providers: [
      provideRouter([]),
      { provide: OrderApiService, useValue: { getOrderById: apiSpy } },
      { provide: ActivatedRoute, useValue: route },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  })
    .compileComponents()
    .then(() => {
      const f = TestBed.createComponent(DashboardOrderDetailNativePage);
      f.detectChanges();
      return f;
    });
}

describe('DashboardOrderDetailNativePage', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('loads the order from the API', async () => {
    const spy = jasmine
      .createSpy('getOrderById')
      .and.returnValue(of(order));
    const fixture = await configure(spy, 'o1');
    const c = fixture.componentInstance;
    expect(spy).toHaveBeenCalledWith('o1');
    expect(c.order()?.id).toBe('o1');
    expect(c.isLoading()).toBeFalse();
    expect(c.notFound()).toBeFalse();
  });

  it('marks not-found when no id is provided', async () => {
    const spy = jasmine.createSpy('getOrderById');
    const fixture = await configure(spy, null);
    const c = fixture.componentInstance;
    expect(spy).not.toHaveBeenCalled();
    expect(c.notFound()).toBeTrue();
  });

  it('marks not-found on api error', async () => {
    const spy = jasmine
      .createSpy('getOrderById')
      .and.returnValue(throwError(() => new Error('boom')));
    const fixture = await configure(spy, 'o1');
    const c = fixture.componentInstance;
    expect(c.notFound()).toBeTrue();
    expect(c.isLoading()).toBeFalse();
  });

  it('returns proper status helpers', async () => {
    const spy = jasmine
      .createSpy('getOrderById')
      .and.returnValue(of(order));
    const fixture = await configure(spy, 'o1');
    const c = fixture.componentInstance;
    expect(c.getStatusColor('paid')).toBe('#34c759');
    expect(c.getStatusLabel('paid')).toBe('Payée');
    expect(c.isPhysical(order)).toBeFalse();
  });
});
