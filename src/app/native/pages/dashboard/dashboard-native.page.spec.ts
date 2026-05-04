import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { Order } from '@core/interfaces/order.interface';
import { Subscription } from '@core/interfaces/subscription.interface';
import { UserResponse } from '@core/interfaces/auth.interface';
import { DashboardNativePage } from './dashboard-native.page';

const user = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'Alice',
  lastName: 'Doe',
  preferredLanguage: 'fr',
} as unknown as UserResponse;

const order: Order = {
  id: 'o1',
  orderNumber: 'CMD-1',
  userId: 'u1',
  guestEmail: null,
  items: [],
  subtotal: 100,
  total: 120,
  status: 'paid',
  billingAddressSnapshot: {},
  createdAt: '2026-04-01T00:00:00Z',
};

const sub: Subscription = {
  id: 's1',
  productId: 'p1',
  productName: 'SOC',
  productImageUrl: null,
  status: 'active',
  price: 50,
  billingPeriod: 'monthly',
  currentPeriodStart: '2026-04-01T00:00:00Z',
  currentPeriodEnd: '2026-05-01T00:00:00Z',
  cancelAtPeriodEnd: false,
};

describe('DashboardNativePage', () => {
  let fixture: ComponentFixture<DashboardNativePage>;
  let component: DashboardNativePage;
  let authStore: { user$: BehaviorSubject<UserResponse | null> };
  let orderStore: {
    orders$: BehaviorSubject<Order[]>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    loadOrders: jasmine.Spy;
  };
  let subStore: {
    subscriptions$: BehaviorSubject<Subscription[]>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    loadSubscriptions: jasmine.Spy;
  };

  beforeEach(async () => {
    authStore = { user$: new BehaviorSubject<UserResponse | null>(user) };
    orderStore = {
      orders$: new BehaviorSubject<Order[]>([order]),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      loadOrders: jasmine.createSpy('loadOrders'),
    };
    subStore = {
      subscriptions$: new BehaviorSubject<Subscription[]>([sub]),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      loadSubscriptions: jasmine.createSpy('loadSubscriptions'),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: OrderStore, useValue: orderStore },
        { provide: SubscriptionStore, useValue: subStore },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads orders and subscriptions on init', () => {
    expect(component).toBeTruthy();
    expect(orderStore.loadOrders).toHaveBeenCalled();
    expect(subStore.loadSubscriptions).toHaveBeenCalled();
  });

  it('exposes user, orders and subscriptions from stores', () => {
    expect(component.user()?.email).toBe('a@b.c');
    expect(component.orders().length).toBe(1);
    expect(component.subscriptions().length).toBe(1);
  });

  it('computes KPIs and recent activity', () => {
    expect(component.activeSubscriptionsCount()).toBe(1);
    expect(component.totalOrdersCount()).toBe(1);
    expect(component.monthlyCost()).toBe(50);
    expect(component.recentOrders().length).toBe(1);
    expect(component.recentSubscriptions().length).toBe(1);
  });

  it('refresh triggers fresh store loads', () => {
    orderStore.loadOrders.calls.reset();
    subStore.loadSubscriptions.calls.reset();
    component.refresh();
    expect(orderStore.loadOrders).toHaveBeenCalled();
    expect(subStore.loadSubscriptions).toHaveBeenCalled();
  });

  it('returns colors and labels for known statuses', () => {
    expect(component.getStatusColor('paid')).toBe('#34c759');
    expect(component.getStatusColor('cancelled')).toBe('#ff383c');
    expect(component.getStatusLabel('paid')).toBe('Payée');
    expect(component.getStatusLabel('unknown')).toBe('unknown');
  });
});
