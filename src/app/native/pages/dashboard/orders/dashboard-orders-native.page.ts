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
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorReceipt,
  phosphorPackage,
  phosphorArrowRight,
} from '@ng-icons/phosphor-icons/regular';
import { OrderStore } from '@core/stores/order.store';
import { Order } from '@core/interfaces/order.interface';
import { NativePageHeaderComponent } from '../../../components/native-page-header.component';
import { SkeletonListComponent } from '../../../components/skeleton-list.component';
import { PullToRefreshComponent } from '../../../components/pull-to-refresh.component';
import { HapticOnDirective } from '../../../directives/haptic-on.directive';

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'Tout' },
  { key: 'paid', label: 'Payée' },
  { key: 'processing', label: 'En cours' },
  { key: 'shipped', label: 'Expédiée' },
  { key: 'completed', label: 'Terminée' },
  { key: 'cancelled', label: 'Annulée' },
];

/**
 * Native list of past orders mounted at `/m/dashboard/orders`.
 */
@Component({
  selector: 'app-dashboard-orders-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    NgIconComponent,
    NativePageHeaderComponent,
    SkeletonListComponent,
    PullToRefreshComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({ phosphorReceipt, phosphorPackage, phosphorArrowRight }),
  ],
  templateUrl: './dashboard-orders-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOrdersNativePage implements OnInit {
  private readonly orderStore = inject(OrderStore);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(PullToRefreshComponent)
  private readonly refresher?: PullToRefreshComponent;

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<string>('');

  readonly statusFilters = STATUS_FILTERS;

  readonly filteredOrders = computed(() => {
    const filter = this.statusFilter();
    if (!filter) return this.orders();
    return this.orders().filter((o) => o.status === filter);
  });

  ngOnInit(): void {
    this.orderStore.orders$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((o) => this.orders.set(o));
    this.orderStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((l) => this.isLoading.set(l));
    this.orderStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => this.error.set(e));

    this.orderStore.loadOrders();
  }

  refresh(): void {
    this.orderStore.loadOrders();
    void this.refresher?.complete();
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
      case 'completed':
        return '#34c759';
      case 'pending':
      case 'processing':
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
    };
    return map[status] || status;
  }
}
