import {
  Component,
  computed,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewWillEnter } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';

Chart.register(...registerables);

/**
 * Native-only mobile dashboard home view.
 *
 * Extracted from `DashboardPage` so it can be registered as the default
 * child route (`path: ''`) of the dashboard sub-router. Putting the home
 * view inside the nested `<ion-router-outlet>` — as a sibling of
 * `orders`, `subscriptions`, `my-licenses` — means Ionic always has a
 * "from" ion-page in the outlet when the user taps a tile, so the
 * iOS slide-in transition (and the edge-swipe-back gesture) runs as it
 * does on top-level routes like `/account/profile`. Previously the home
 * content lived as a sibling of the outlet via `@if (!hasChildRoute())`
 * inside `DashboardPage`, so the outlet was empty at `/dashboard` and
 * Ionic had nothing to animate from when entering a child route.
 */
@Component({
  standalone: false,
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.page.html',
})
export class DashboardHomePage implements OnDestroy, ViewWillEnter {
  @ViewChild('monthlyCostChart')
  monthlyCostChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(MobilePageShellComponent) shell?: MobilePageShellComponent;

  private readonly authStore = inject(AuthStore);
  private readonly orderStore = inject(OrderStore);
  private readonly subscriptionStore = inject(SubscriptionStore);

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

  activeSubscriptionsCount = computed(
    () => this.subscriptions().filter((s) => s.status === 'active').length,
  );

  totalOrdersCount = computed(() => this.orders().length);

  activeSubscriptions = computed(() =>
    this.subscriptions().filter((s) => s.status === 'active'),
  );

  monthlyCost = computed(() => {
    return this.activeSubscriptions().reduce((sum, s) => {
      const price = Number(s.price) || 0;
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
      .reduce((sum, s) => sum + (Number(s.price) || 0) * 1.2, 0);
  });

  recentOrders = computed(() =>
    [...this.orders()]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3),
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

        if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd) {
          const endDate = new Date(sub.currentPeriodEnd);
          if (monthDate >= endDate) continue;
        }

        if (sub.billingPeriod === 'yearly') {
          const start = new Date(sub.currentPeriodStart);
          const renewalMonth = start.getMonth();
          if (monthDate.getMonth() === renewalMonth) {
            const yearsSinceStart =
              monthDate.getFullYear() - start.getFullYear();
            if (yearsSinceStart >= 0 && monthDate >= start) {
              values[i] += price * 1.2;
            }
          }
        } else {
          const startMonth = new Date(sub.currentPeriodStart);
          const startMonthNum =
            startMonth.getFullYear() * 12 + startMonth.getMonth();
          if (targetMonth >= startMonthNum) {
            values[i] += price * 1.2;
          }
        }
      }
      values[i] = Math.round(values[i] * 100) / 100;
    }
    return values;
  });

  private chartEffect = effect(() => {
    this.monthlyCostChartValues();

    if (this.chartRetryTimer) {
      clearTimeout(this.chartRetryTimer);
      this.chartRetryTimer = null;
    }
    this.chart?.destroy();
    this.chart = null;

    this.waitForCanvasAndInit();
  });

  ionViewWillEnter(): void {
    this.shell?.refresh();
    this.orderStore.loadOrders();
    this.subscriptionStore.loadSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.chartRetryTimer) {
      clearTimeout(this.chartRetryTimer);
    }
    this.chart?.destroy();
  }

  private waitForCanvasAndInit(attempts = 0): void {
    if (attempts > 20) return;
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
                `${(tooltipCtx.parsed.y ?? 0).toLocaleString('fr-FR')} €`,
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
              callback: (value) => `${Number(value).toLocaleString('fr-FR')} €`,
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
