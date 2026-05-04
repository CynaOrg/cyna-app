import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { Subscription } from '@core/interfaces/subscription.interface';
import { DashboardSubscriptionsNativePage } from './dashboard-subscriptions-native.page';

const s1: Subscription = {
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
const s2: Subscription = { ...s1, id: 's2', status: 'cancelled' };

describe('DashboardSubscriptionsNativePage', () => {
  let fixture: ComponentFixture<DashboardSubscriptionsNativePage>;
  let component: DashboardSubscriptionsNativePage;
  let store: {
    subscriptions$: BehaviorSubject<Subscription[]>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
    loadSubscriptions: jasmine.Spy;
    cancelSubscription: jasmine.Spy;
  };

  beforeEach(async () => {
    store = {
      subscriptions$: new BehaviorSubject<Subscription[]>([s1, s2]),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
      loadSubscriptions: jasmine.createSpy('loadSubscriptions'),
      cancelSubscription: jasmine.createSpy('cancelSubscription'),
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardSubscriptionsNativePage,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: SubscriptionStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSubscriptionsNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads subscriptions on init', () => {
    expect(component).toBeTruthy();
    expect(store.loadSubscriptions).toHaveBeenCalled();
    expect(component.subscriptions().length).toBe(2);
  });

  it('filters subscriptions by status', () => {
    component.setStatusFilter('active');
    expect(component.filteredSubscriptions().length).toBe(1);
    component.setStatusFilter('');
    expect(component.filteredSubscriptions().length).toBe(2);
  });

  it('handles confirm/cancel/uncancel flow', () => {
    component.confirmCancel('s1');
    expect(component.confirmingCancelId()).toBe('s1');
    component.cancelCancel();
    expect(component.confirmingCancelId()).toBeNull();
    component.confirmCancel('s1');
    component.doCancel('s1');
    expect(store.cancelSubscription).toHaveBeenCalledWith('s1');
    expect(component.confirmingCancelId()).toBeNull();
  });

  it('refresh reloads from the store', () => {
    store.loadSubscriptions.calls.reset();
    component.refresh();
    expect(store.loadSubscriptions).toHaveBeenCalled();
  });

  it('returns proper status helpers', () => {
    expect(component.getStatusColor('active')).toBe('#34c759');
    expect(component.getStatusLabel('active')).toBe('Active');
  });
});
