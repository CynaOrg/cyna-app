import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { OrderStore } from '@core/stores/order.store';
import { Order } from '@core/interfaces/order.interface';
import { DashboardOrdersNativePage } from './dashboard-orders-native.page';

const o1: Order = {
  id: 'o1',
  orderNumber: 'CMD-1',
  userId: 'u',
  guestEmail: null,
  items: [],
  subtotal: 100,
  total: 120,
  status: 'paid',
  billingAddressSnapshot: {},
  createdAt: '2026-04-01T00:00:00Z',
};
const o2: Order = { ...o1, id: 'o2', orderNumber: 'CMD-2', status: 'pending' };

describe('DashboardOrdersNativePage', () => {
  let fixture: ComponentFixture<DashboardOrdersNativePage>;
  let component: DashboardOrdersNativePage;
  let store: {
    orders$: BehaviorSubject<Order[]>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    loadOrders: jasmine.Spy;
  };

  beforeEach(async () => {
    store = {
      orders$: new BehaviorSubject<Order[]>([o1, o2]),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      loadOrders: jasmine.createSpy('loadOrders'),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardOrdersNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: OrderStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOrdersNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads orders on init', () => {
    expect(component).toBeTruthy();
    expect(store.loadOrders).toHaveBeenCalled();
    expect(component.orders().length).toBe(2);
  });

  it('filters orders by status', () => {
    component.setStatusFilter('paid');
    expect(component.filteredOrders().length).toBe(1);
    expect(component.filteredOrders()[0].id).toBe('o1');
    component.setStatusFilter('');
    expect(component.filteredOrders().length).toBe(2);
  });

  it('refresh reloads orders', () => {
    store.loadOrders.calls.reset();
    component.refresh();
    expect(store.loadOrders).toHaveBeenCalled();
  });

  it('returns proper status colors and labels', () => {
    expect(component.getStatusColor('paid')).toBe('#34c759');
    expect(component.getStatusColor('shipped')).toBe('#007aff');
    expect(component.getStatusLabel('paid')).toBe('Payée');
    expect(component.getStatusLabel('xyz')).toBe('xyz');
  });
});
