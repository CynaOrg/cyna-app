import { Component, computed, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  standalone: false,
})
export class DashboardPage implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly orderStore = inject(OrderStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly router = inject(Router);

  user = toSignal(this.authStore.user$, { initialValue: null });
  orders = toSignal(this.orderStore.orders$, { initialValue: [] });
  ordersLoading = toSignal(this.orderStore.isLoading$, { initialValue: false });
  subscriptions = toSignal(this.subscriptionStore.subscriptions$, {
    initialValue: [],
  });
  subscriptionsLoading = toSignal(this.subscriptionStore.isLoading$, {
    initialValue: false,
  });

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  hasChildRoute = computed(() => this.currentUrl() !== '/dashboard');

  topbarTitle = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/dashboard/orders')) return 'DASHBOARD.ORDERS.TITLE';
    if (url.startsWith('/dashboard/subscriptions'))
      return 'DASHBOARD.SUBSCRIPTIONS.TITLE';
    if (url.startsWith('/dashboard/my-licenses'))
      return 'DASHBOARD.LICENSES.TITLE';
    if (url.startsWith('/dashboard/licenses')) return 'CATALOG.LICENSES_TITLE';
    return 'DASHBOARD.TITLE';
  });

  topbarSubtitle = computed(() => {
    const url = this.currentUrl();
    if (url === '/dashboard') return 'DASHBOARD.SUBTITLE';
    return '';
  });

  // Computed KPI values
  activeSubscriptionsCount = computed(
    () => this.subscriptions().filter((s) => s.status === 'active').length,
  );

  totalOrdersCount = computed(() => this.orders().length);

  // Monthly cost: sum of active subscriptions normalized to monthly
  monthlyCost = computed(() => {
    return this.activeSubscriptions().reduce((sum, s) => {
      if (s.billingPeriod === 'yearly') return sum + s.price / 12;
      return sum + s.price;
    }, 0);
  });

  // Next payment: closest currentPeriodEnd among active subscriptions
  nextPaymentDate = computed(() => {
    const activeSubs = this.activeSubscriptions();
    if (!activeSubs.length) return null;
    const sorted = [...activeSubs].sort(
      (a, b) =>
        new Date(a.currentPeriodEnd).getTime() -
        new Date(b.currentPeriodEnd).getTime(),
    );
    return sorted[0].currentPeriodEnd;
  });

  // Pending orders count
  pendingOrdersCount = computed(
    () =>
      this.orders().filter(
        (o) => o.status === 'pending' || o.status === 'processing',
      ).length,
  );

  recentOrders = computed(() =>
    [...this.orders()]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3),
  );

  activeSubscriptions = computed(() =>
    this.subscriptions().filter((s) => s.status === 'active'),
  );

  isDataLoading = computed(
    () => this.ordersLoading() || this.subscriptionsLoading(),
  );

  ngOnInit(): void {
    this.orderStore.loadOrders();
    this.subscriptionStore.loadSubscriptions();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'active':
        return '#34c759';
      case 'pending':
      case 'processing':
      case 'past_due':
        return '#ff9500';
      case 'shipped':
        return '#007aff';
      case 'cancelled':
      case 'refunded':
        return '#ff383c';
      default:
        return '#9ca3af';
    }
  }
}
