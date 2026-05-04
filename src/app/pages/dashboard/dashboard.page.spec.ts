import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorEnvelopeSimple,
  phosphorClipboardText,
  phosphorCalendarBlank,
  phosphorPackage,
  phosphorShieldCheck,
  phosphorKey,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardPage } from './dashboard.page';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { CartStore } from '@core/stores/cart.store';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';
import { SkeletonListComponent } from '@shared/components/skeleton';
import { PullToRefreshComponent } from '@shared/components/pull-to-refresh';
import { HapticOnDirective } from '@shared/directives';

describe('DashboardPage', () => {
  const mockAuthStore = {
    user$: new BehaviorSubject({ id: 'u1', email: 'a@a.com' }),
  };
  const mockOrderStore = {
    orders$: new BehaviorSubject<unknown[]>([]),
    isLoading$: new BehaviorSubject(false),
    loadOrders: jasmine.createSpy('loadOrders'),
  };
  const mockSubStore = {
    subscriptions$: new BehaviorSubject<unknown[]>([]),
    isLoading$: new BehaviorSubject(false),
    loadSubscriptions: jasmine.createSpy('loadSubscriptions'),
  };
  const mockCartStore = {
    items$: new BehaviorSubject<unknown[]>([]),
    count$: new BehaviorSubject(0),
    total$: new BehaviorSubject(0),
    isEmpty$: new BehaviorSubject(true),
    isLoading$: new BehaviorSubject(false),
    error$: new BehaviorSubject<string | null>(null),
    cart$: new BehaviorSubject(null),
    loadCart: jasmine.createSpy('loadCart'),
  };

  beforeEach(async () => {
    mockOrderStore.loadOrders.calls.reset();
    mockSubStore.loadSubscriptions.calls.reset();

    await TestBed.configureTestingModule({
      declarations: [DashboardPage],
      imports: [
        CommonModule,
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        NgIconComponent,
        DashboardTopBarComponent,
        SkeletonListComponent,
        PullToRefreshComponent,
        HapticOnDirective,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: OrderStore, useValue: mockOrderStore },
        { provide: SubscriptionStore, useValue: mockSubStore },
        { provide: CartStore, useValue: mockCartStore },
        provideIcons({
          phosphorEnvelopeSimple,
          phosphorClipboardText,
          phosphorCalendarBlank,
          phosphorPackage,
          phosphorShieldCheck,
          phosphorKey,
          phosphorUser,
        }),
      ],
    }).compileComponents();
  });

  function build() {
    const fixture = TestBed.createComponent(DashboardPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create and load orders + subscriptions', () => {
    const { component } = build();
    expect(component).toBeTruthy();
    expect(mockOrderStore.loadOrders).toHaveBeenCalled();
    expect(mockSubStore.loadSubscriptions).toHaveBeenCalled();
  });

  it('triggers reload of orders + subscriptions on pull-to-refresh', async () => {
    const { component } = build();
    mockOrderStore.loadOrders.calls.reset();
    mockSubStore.loadSubscriptions.calls.reset();

    const completeSpy = jasmine
      .createSpy('complete')
      .and.returnValue(Promise.resolve());
    const refresher = {
      complete: completeSpy,
    } as unknown as PullToRefreshComponent;

    await component.onRefresh(refresher);

    expect(mockOrderStore.loadOrders).toHaveBeenCalled();
    expect(mockSubStore.loadSubscriptions).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('exposes monthly cost computation aggregating subscriptions', () => {
    mockSubStore.subscriptions$.next([
      {
        id: 's1',
        status: 'active',
        billingPeriod: 'monthly',
        price: 50,
        currentPeriodEnd: new Date(Date.now() + 86_400_000).toISOString(),
        currentPeriodStart: new Date().toISOString(),
        cancelAtPeriodEnd: false,
      },
      {
        id: 's2',
        status: 'active',
        billingPeriod: 'yearly',
        price: 1200,
        currentPeriodEnd: new Date(Date.now() + 86_400_000).toISOString(),
        currentPeriodStart: new Date().toISOString(),
        cancelAtPeriodEnd: false,
      },
    ]);
    const { component } = build();
    expect(component.activeSubscriptionsCount()).toBe(2);
    // 50 (monthly) + 1200/12 = 100 → 150
    expect(component.monthlyCost()).toBe(150);
  });
});
