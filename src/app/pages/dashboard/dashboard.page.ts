import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { IonContent } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  @ViewChild('monthlyCostChart')
  monthlyCostChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(IonContent) ionContent!: IonContent;

  private readonly authStore = inject(AuthStore);
  private readonly orderStore = inject(OrderStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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
      const price = Number(s.price) || 0;
      if (s.billingPeriod === 'yearly') return sum + price / 12;
      return sum + price;
    }, 0);
  });

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
      .sort(
        (a, b) =>
          new Date(b.currentPeriodStart).getTime() -
          new Date(a.currentPeriodStart).getTime(),
      )
      .slice(0, 2),
  );

  isDataLoading = computed(
    () => this.ordersLoading() || this.subscriptionsLoading(),
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
              values[i] += price;
            }
          }
        } else {
          // Monthly: charged every month the sub is active
          const startMonth = new Date(sub.currentPeriodStart);
          const startMonthNum =
            startMonth.getFullYear() * 12 + startMonth.getMonth();
          if (targetMonth >= startMonthNum) {
            values[i] += price;
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
    this.orderStore.loadOrders();
    this.subscriptionStore.loadSubscriptions();

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
