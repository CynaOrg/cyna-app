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

  ngOnInit(): void {
    this.subscriptionStore.loadSubscriptions();
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
