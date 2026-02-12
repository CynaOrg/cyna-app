import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SubscriptionStore } from '@core/stores/subscription.store';

@Component({
  standalone: false,
  selector: 'app-dashboard-subscriptions',
  templateUrl: './subscriptions.page.html',
})
export class DashboardSubscriptionsPage implements OnInit {
  private readonly subscriptionStore = inject(SubscriptionStore);

  subscriptions = toSignal(this.subscriptionStore.subscriptions$, {
    initialValue: [],
  });
  isLoading = toSignal(this.subscriptionStore.isLoading$, {
    initialValue: false,
  });
  error = toSignal(this.subscriptionStore.error$, { initialValue: null });

  confirmingCancelId: string | null = null;
  statusFilter = '';

  ngOnInit(): void {
    this.subscriptionStore.loadSubscriptions();
  }

  get filteredSubscriptions() {
    if (!this.statusFilter) return this.subscriptions();
    return this.subscriptions().filter((s) => s.status === this.statusFilter);
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
  }

  getStatusCount(status: string): number {
    if (!status) return this.subscriptions().length;
    return this.subscriptions().filter((s) => s.status === status).length;
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

  getStatusTranslationKey(status: string): string {
    return 'DASHBOARD.SUBSCRIPTIONS.STATUS_' + status.toUpperCase();
  }

  confirmCancel(id: string): void {
    this.confirmingCancelId = id;
  }

  cancelCancel(): void {
    this.confirmingCancelId = null;
  }

  doCancel(id: string): void {
    this.subscriptionStore.cancelSubscription(id);
    this.confirmingCancelId = null;
  }
}
