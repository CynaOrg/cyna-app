import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent } from '@ng-icons/core';
import { Subscription, Order } from '@core/interfaces';

@Component({
  selector: 'app-billing-tab',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NgIconComponent],
  templateUrl: './billing-tab.component.html',
})
export class BillingTabComponent {
  @Input() subscriptions: Subscription[] = [];
  @Input() orders: Order[] = [];
  @Input() upcomingRenewals: Subscription[] = [];
  @Input() subscriptionsLoading = false;
  @Input() ordersLoading = false;
  @Input() error: string | null = null;

  getSubscriptionStatusColor(status: string): string {
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

  getOrderStatusColor(status: string): string {
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
}