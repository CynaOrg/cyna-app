import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorReceipt,
  phosphorPackage,
  phosphorCreditCard,
  phosphorMapPin,
  phosphorKey,
  phosphorUser,
  phosphorArrowRight,
  phosphorCalendar,
  phosphorChartBar,
} from '@ng-icons/phosphor-icons/regular';
import { AuthStore } from '@core/stores/auth.store';
import { OrderStore } from '@core/stores/order.store';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { Order } from '@core/interfaces/order.interface';
import { Subscription } from '@core/interfaces/subscription.interface';
import { UserResponse } from '@core/interfaces/auth.interface';
import { SkeletonListComponent } from '../../components/skeleton-list.component';
import { PullToRefreshComponent } from '../../components/pull-to-refresh.component';
import { HapticOnDirective } from '../../directives/haptic-on.directive';

/**
 * Native dashboard home page mounted at `/m/dashboard`.
 *
 * Mirrors the web `DashboardPage` (KPIs + recent activity) but adapted to a
 * single-column mobile layout. Auth-protected: when the user is not signed in
 * the page defers to `authGuard` and bounces them through `/m/auth/login`.
 */
@Component({
  selector: 'app-dashboard-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    NgIconComponent,
    SkeletonListComponent,
    PullToRefreshComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({
      phosphorReceipt,
      phosphorPackage,
      phosphorCreditCard,
      phosphorMapPin,
      phosphorKey,
      phosphorUser,
      phosphorArrowRight,
      phosphorCalendar,
      phosphorChartBar,
    }),
  ],
  templateUrl: './dashboard-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardNativePage implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly orderStore = inject(OrderStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  @ViewChild(PullToRefreshComponent)
  private readonly refresher?: PullToRefreshComponent;

  readonly user = signal<UserResponse | null>(null);
  readonly orders = signal<Order[]>([]);
  readonly subscriptions = signal<Subscription[]>([]);
  readonly isLoading = signal(false);

  readonly activeSubscriptions = computed(() =>
    this.subscriptions().filter((s) => s.status === 'active'),
  );

  readonly activeSubscriptionsCount = computed(
    () => this.activeSubscriptions().length,
  );

  readonly totalOrdersCount = computed(() => this.orders().length);

  readonly monthlyCost = computed(() =>
    this.activeSubscriptions().reduce((sum, s) => {
      const price = Number(s.price) || 0;
      if (s.billingPeriod === 'yearly') return sum + price / 12;
      return sum + price;
    }, 0),
  );

  readonly recentOrders = computed(() =>
    [...this.orders()]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3),
  );

  readonly recentSubscriptions = computed(() =>
    [...this.subscriptions()]
      .filter((s) => s.status === 'active')
      .sort(
        (a, b) =>
          new Date(b.currentPeriodStart).getTime() -
          new Date(a.currentPeriodStart).getTime(),
      )
      .slice(0, 3),
  );

  ngOnInit(): void {
    this.authStore.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => this.user.set(u));

    this.orderStore.orders$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((o) => this.orders.set(o));

    this.subscriptionStore.subscriptions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.subscriptions.set(s));

    this.orderStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((l) => this.isLoading.set(l));

    this.fetchAll();
  }

  refresh(): void {
    this.fetchAll(() => void this.refresher?.complete());
  }

  goToLogin(): void {
    this.router.navigateByUrl('/m/auth/login');
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

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payée',
      processing: 'En cours',
      shipped: 'Expédiée',
      completed: 'Terminée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
      active: 'Active',
      past_due: 'En retard',
      paused: 'En pause',
    };
    return map[status] || status;
  }

  private fetchAll(done?: () => void): void {
    this.orderStore.loadOrders();
    this.subscriptionStore.loadSubscriptions();
    // The stores fire-and-forget; we resolve the refresher immediately so the
    // pull animation closes — data updates flow in via the subscriptions above.
    done?.();
  }
}
