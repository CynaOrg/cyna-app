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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorChartBar,
  phosphorXCircle,
  phosphorPause,
} from '@ng-icons/phosphor-icons/regular';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { Subscription } from '@core/interfaces/subscription.interface';
import { NativePageHeaderComponent } from '../../../components/native-page-header.component';
import { SkeletonListComponent } from '../../../components/skeleton-list.component';
import { PullToRefreshComponent } from '../../../components/pull-to-refresh.component';
import { HapticOnDirective } from '../../../directives/haptic-on.directive';

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'Tout' },
  { key: 'active', label: 'Actifs' },
  { key: 'past_due', label: 'En retard' },
  { key: 'cancelled', label: 'Annulés' },
];

/**
 * Native list of user subscriptions mounted at `/m/dashboard/subscriptions`.
 */
@Component({
  selector: 'app-dashboard-subscriptions-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgIconComponent,
    NativePageHeaderComponent,
    SkeletonListComponent,
    PullToRefreshComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({ phosphorChartBar, phosphorXCircle, phosphorPause }),
  ],
  templateUrl: './dashboard-subscriptions-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSubscriptionsNativePage implements OnInit {
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(PullToRefreshComponent)
  private readonly refresher?: PullToRefreshComponent;

  readonly subscriptions = signal<Subscription[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<string>('');
  readonly confirmingCancelId = signal<string | null>(null);

  readonly statusFilters = STATUS_FILTERS;

  readonly filteredSubscriptions = computed(() => {
    const filter = this.statusFilter();
    if (!filter) return this.subscriptions();
    return this.subscriptions().filter((s) => s.status === filter);
  });

  ngOnInit(): void {
    this.subscriptionStore.subscriptions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((s) => this.subscriptions.set(s));
    this.subscriptionStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((l) => this.isLoading.set(l));
    this.subscriptionStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => this.error.set(e));

    this.subscriptionStore.loadSubscriptions();
  }

  refresh(): void {
    this.subscriptionStore.loadSubscriptions();
    void this.refresher?.complete();
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
  }

  confirmCancel(id: string): void {
    this.confirmingCancelId.set(id);
  }

  cancelCancel(): void {
    this.confirmingCancelId.set(null);
  }

  doCancel(id: string): void {
    this.subscriptionStore.cancelSubscription(id);
    this.confirmingCancelId.set(null);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#34c759';
      case 'past_due':
        return '#ff9500';
      case 'cancelled':
        return '#ff383c';
      case 'paused':
        return '#9ca3af';
      default:
        return '#9ca3af';
    }
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Active',
      past_due: 'En retard',
      cancelled: 'Annulée',
      paused: 'En pause',
    };
    return map[status] || status;
  }
}
