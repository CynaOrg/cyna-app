import {
  Component,
  computed,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  standalone: false,
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('expenseChart') expenseChartRef!: ElementRef<HTMLCanvasElement>;

  private readonly authStore = inject(AuthStore);
  private readonly orderStore = inject(OrderStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly router = inject(Router);

  private chart: Chart | null = null;

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

  // Chart period selector
  selectedPeriod = signal<'week' | 'month' | 'year'>('month');

  // Mock expense data for chart
  private readonly monthlyData = {
    labels: this.getLastMonths(6),
    values: [1240, 1580, 1340, 1890, 1650, 1920],
  };

  private readonly weeklyData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    values: [320, 280, 410, 150, 390, 0, 0],
  };

  private readonly yearlyData = {
    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
    values: [8400, 12600, 15200, 18900, 21400, 23100],
  };

  // Pre-computed sparkline polyline points for SVG
  readonly sparklineSubs = '0,20 13,18 26,15 39,16 52,12 65,8 80,5';
  readonly sparklineCost = '0,18 13,20 26,15 39,12 52,14 65,9 80,6';
  readonly sparklineOrders = '0,22 13,18 26,20 39,14 52,16 65,10 80,8';
  readonly sparklinePayment = '0,15 13,12 26,18 39,10 52,8 65,14 80,6';

  // Chart total computed based on period
  chartTotal = computed(() => {
    const period = this.selectedPeriod();
    if (period === 'week')
      return this.weeklyData.values.reduce((a, b) => a + b, 0);
    if (period === 'year')
      return this.yearlyData.values.reduce((a, b) => a + b, 0);
    return this.monthlyData.values.reduce((a, b) => a + b, 0);
  });

  ngOnInit(): void {
    this.orderStore.loadOrders();
    this.subscriptionStore.loadSubscriptions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initChart(), 100);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  selectPeriod(period: 'week' | 'month' | 'year'): void {
    this.selectedPeriod.set(period);
    this.updateChart();
  }

  private getLastMonths(count: number): string[] {
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
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(months[d.getMonth()]);
    }
    return result;
  }

  private getChartData(): { labels: string[]; values: number[] } {
    const period = this.selectedPeriod();
    if (period === 'week') return this.weeklyData;
    if (period === 'year') return this.yearlyData;
    return this.monthlyData;
  }

  private initChart(): void {
    if (!this.expenseChartRef?.nativeElement) return;

    const data = this.getChartData();
    const ctx = this.expenseChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(79, 57, 246, 0.25)');
    gradient.addColorStop(1, 'rgba(79, 57, 246, 0.02)');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: gradient,
            borderColor: '#4f39f6',
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.55,
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
            titleFont: { family: 'Inter', size: 12, weight: 'bold' as const },
            bodyFont: { family: 'Inter', size: 13 },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (ctx) =>
                `${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')}\u00A0\u20AC`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 11 },
            },
          },
          y: {
            grid: {
              color: 'rgba(0,0,0,0.04)',
            },
            border: { display: false, dash: [4, 4] },
            ticks: {
              color: '#9ca3af',
              font: { family: 'Inter', size: 11 },
              callback: (value) =>
                `${Number(value).toLocaleString('fr-FR')}\u00A0\u20AC`,
              maxTicksLimit: 5,
            },
          },
        },
      },
    });
  }

  private updateChart(): void {
    if (!this.chart) return;

    const data = this.getChartData();
    const ctx = this.expenseChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(79, 57, 246, 0.25)');
    gradient.addColorStop(1, 'rgba(79, 57, 246, 0.02)');

    this.chart.data.labels = data.labels;
    this.chart.data.datasets[0].data = data.values;
    this.chart.data.datasets[0].backgroundColor = gradient;
    this.chart.update('active');
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
