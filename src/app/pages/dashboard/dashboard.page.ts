import {
  Component,
  computed,
  DestroyRef,
  effect,
  HostBinding,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { VAT_MULTIPLIER } from '@core/constants/tax.constants';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { IonContent, IonRouterOutlet, ViewWillEnter } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy, ViewWillEnter {
  /**
   * Tag the host element with the Ionic `.ion-page` class only on native.
   * The root `<ion-router-outlet>` in app.component.html relies on its
   * direct routed child being an ion-page to run the iOS slide-in
   * transition. AccountPage already declares this class, but DashboardPage
   * historically did not, so cross-tab navigation from /account to
   * /dashboard/orders (or any /dashboard/* child) swapped views instantly
   * with no animation. Restricting the class to native preserves the
   * web sidebar/dashboard-layout flex behavior unchanged.
   */
  @HostBinding('class.ion-page') readonly hostIonPage = isNativeCapacitor();

  @ViewChild('monthlyCostChart')
  monthlyCostChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(IonContent) ionContent!: IonContent;
  @ViewChild(IonRouterOutlet) routerOutlet?: IonRouterOutlet;

  /**
   * When the user pops back to /dashboard from /cart while a child route
   * was active inside the nested router-outlet (e.g. /dashboard/orders),
   * Ionic re-fires `ionViewWillEnter` on this page but NOT on the nested
   * child — its outlet's active view didn't change. We dispatch the
   * lifecycle event onto the inner shell element so its `@HostListener`
   * picks it up and re-applies the topbar config.
   */
  ionViewWillEnter(): void {
    const childEl = this.routerOutlet?.activatedView?.element;
    if (!childEl) return;
    const shellEl = childEl.querySelector('app-mobile-page-shell');
    shellEl?.dispatchEvent(new CustomEvent('ionViewWillEnter'));
  }

  private readonly authStore = inject(AuthStore);
  private readonly orderStore = inject(OrderStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isNative = isNativeCapacitor();

  private chart: Chart | null = null;
  private chartRetryTimer: ReturnType<typeof setTimeout> | null = null;

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

  activeSubscriptionsCount = computed(
    () => this.subscriptions().filter((s) => s.status === 'active').length,
  );

  totalOrdersCount = computed(() => this.orders().length);

  monthlyCost = computed(() => {
    return this.activeSubscriptions().reduce((sum, s) => {
      const price = (Number(s.price) || 0) * VAT_MULTIPLIER;
      if (s.billingPeriod === 'yearly') return sum + price / 12;
      return sum + price;
    }, 0);
  });

  nextPaymentDate = computed(() => {
    const activeSubs = this.activeSubscriptions().filter(
      (s) => !s.cancelAtPeriodEnd,
    );
    if (!activeSubs.length) return null;
    const sorted = [...activeSubs].sort(
      (a, b) =>
        new Date(a.currentPeriodEnd).getTime() -
        new Date(b.currentPeriodEnd).getTime(),
    );
    return sorted[0].currentPeriodEnd;
  });

  nextPaymentAmount = computed(() => {
    const date = this.nextPaymentDate();
    if (!date) return 0;
    const targetDate = new Date(date);
    const targetDay = targetDate.toISOString().slice(0, 10);
    return this.activeSubscriptions()
      .filter((s) => !s.cancelAtPeriodEnd)
      .filter(
        (s) =>
          new Date(s.currentPeriodEnd).toISOString().slice(0, 10) === targetDay,
      )
      .reduce((sum, s) => sum + (Number(s.price) || 0) * VAT_MULTIPLIER, 0);
  });

  pastDueSubscriptionsCount = computed(
    () => this.subscriptions().filter((s) => s.status === 'past_due').length,
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

  recentSubscriptions = computed(() =>
    [...this.subscriptions()]
      .filter((s) => s.status === 'active')
      .sort(
        (a, b) =>
          new Date(b.currentPeriodStart).getTime() -
          new Date(a.currentPeriodStart).getTime(),
      )
      .slice(0, 3),
  );

  isDataLoading = computed(
    () => this.ordersLoading() || this.subscriptionsLoading(),
  );

  /**
   * Mobile dashboard: true when account has no orders and no subscriptions
   * (and we are not currently loading). Used to render an empty-state CTA
   * inviting the user to browse the catalog.
   */
  mobileIsEmpty = computed(
    () =>
      !this.isDataLoading() &&
      this.orders().length === 0 &&
      this.subscriptions().length === 0,
  );

  monthlyCostChartLabels = this.getNextMonths(6);

  monthlyCostChartValues = computed(() => {
    const subs = this.subscriptions();
    const values = new Array(6).fill(0);
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
      const targetMonth = monthDate.getFullYear() * 12 + monthDate.getMonth();

      for (const sub of subs) {
        if (sub.status !== 'active') continue;
        const price = Number(sub.price) || 0;

        // If cancelled at period end, subscription stops after currentPeriodEnd
        if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd) {
          const endDate = new Date(sub.currentPeriodEnd);
          if (monthDate >= endDate) continue;
        }

        if (sub.billingPeriod === 'yearly') {
          // Yearly: renewal month = same month as start, each year
          const start = new Date(sub.currentPeriodStart);
          const renewalMonth = start.getMonth();
          if (monthDate.getMonth() === renewalMonth) {
            // Check it falls within an active year
            const yearsSinceStart =
              monthDate.getFullYear() - start.getFullYear();
            if (yearsSinceStart >= 0 && monthDate >= start) {
              values[i] += price * VAT_MULTIPLIER;
            }
          }
        } else {
          // Monthly: charged every month the sub is active
          const startMonth = new Date(sub.currentPeriodStart);
          const startMonthNum =
            startMonth.getFullYear() * 12 + startMonth.getMonth();
          if (targetMonth >= startMonthNum) {
            values[i] += price * VAT_MULTIPLIER;
          }
        }
      }
      values[i] = Math.round(values[i] * 100) / 100;
    }
    return values;
  });

  private chartEffect = effect(() => {
    // Read reactive dependencies
    this.monthlyCostChartValues();
    const isHome = !this.hasChildRoute();

    // Clean up
    if (this.chartRetryTimer) {
      clearTimeout(this.chartRetryTimer);
      this.chartRetryTimer = null;
    }
    this.chart?.destroy();
    this.chart = null;

    if (!isHome) return;

    // Recreate chart with fresh data
    this.waitForCanvasAndInit();
  });

  ngOnInit(): void {
    // Wait for the auth store to publish a real user before hitting the
    // /orders and /subscriptions endpoints. On a fresh login the redirect
    // to /dashboard can race the moment the access token is committed to
    // the AuthStore — without this guard the first request fires before
    // the interceptor sees the token, comes back empty, and the dashboard
    // KPIs stick at 0 until the user manually refreshes.
    //
    // Re-fire on every user identity change (not just the first emission)
    // so a logout/login sequence inside the same component lifetime reloads
    // the data — and so a transient null mid-flow does not freeze the page.
    this.authStore.user$
      .pipe(
        map((u) => u?.id ?? null),
        distinctUntilChanged(),
        filter((id): id is string => !!id),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.orderStore.loadOrders();
        this.subscriptionStore.loadSubscriptions();
      });

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.ionContent?.scrollToTop(0);
      });
  }

  ngOnDestroy(): void {
    if (this.chartRetryTimer) {
      clearTimeout(this.chartRetryTimer);
    }
    this.chart?.destroy();
  }

  private waitForCanvasAndInit(attempts = 0): void {
    if (attempts > 20) return; // Give up after ~1s
    if (this.monthlyCostChartRef?.nativeElement) {
      this.initChart();
    } else {
      this.chartRetryTimer = setTimeout(
        () => this.waitForCanvasAndInit(attempts + 1),
        50,
      );
    }
  }

  private getNextMonths(count: number): string[] {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Avr',
      'Mai',
      'Jun',
      'Jul',
      'Aou',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const now = new Date();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      result.push(months[d.getMonth()]);
    }
    return result;
  }

  private initChart(): void {
    if (!this.monthlyCostChartRef?.nativeElement) return;
    this.chart?.destroy();

    const ctx = this.monthlyCostChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(79, 57, 246, 0.18)');
    gradient.addColorStop(1, 'rgba(79, 57, 246, 0.01)');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthlyCostChartLabels,
        datasets: [
          {
            data: this.monthlyCostChartValues(),
            backgroundColor: gradient,
            borderColor: '#4f39f6',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0a0a0a',
            titleColor: '#f9f9f9',
            bodyColor: '#f9f9f9',
            titleFont: { family: 'Inter', size: 11, weight: 'bold' as const },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 8,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: (tooltipCtx) =>
                `${(tooltipCtx.parsed.y ?? 0).toLocaleString('fr-FR')}\u00A0\u20AC`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 10 },
            },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.03)' },
            border: { display: false },
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 10 },
              callback: (value) =>
                `${Number(value).toLocaleString('fr-FR')}\u00A0\u20AC`,
              maxTicksLimit: 4,
            },
          },
        },
      },
    });
  }

  getOrderStatusKey(status: string): string {
    const map: Record<string, string> = {
      pending: 'DASHBOARD.ORDERS.STATUS_PENDING',
      paid: 'DASHBOARD.ORDERS.STATUS_PAID',
      processing: 'DASHBOARD.ORDERS.STATUS_PROCESSING',
      shipped: 'DASHBOARD.ORDERS.STATUS_SHIPPED',
      completed: 'DASHBOARD.ORDERS.STATUS_COMPLETED',
      cancelled: 'DASHBOARD.ORDERS.STATUS_CANCELLED',
      refunded: 'DASHBOARD.ORDERS.STATUS_REFUNDED',
    };
    return map[status] || status;
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
