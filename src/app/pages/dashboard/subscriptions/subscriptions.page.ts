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

  private readonly gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ];

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

  getProductInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  getItemGradient(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.gradients[Math.abs(hash) % this.gradients.length];
  }
}
