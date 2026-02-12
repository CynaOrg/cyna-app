import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderStore } from '@core/stores/order.store';

@Component({
  standalone: false,
  selector: 'app-dashboard-orders',
  templateUrl: './orders.page.html',
})
export class DashboardOrdersPage implements OnInit {
  private readonly orderStore = inject(OrderStore);

  orders = toSignal(this.orderStore.orders$, { initialValue: [] });
  isLoading = toSignal(this.orderStore.isLoading$, { initialValue: false });
  error = toSignal(this.orderStore.error$, { initialValue: null });

  statusFilter = '';

  ngOnInit(): void {
    this.orderStore.loadOrders();
  }

  get filteredOrders() {
    if (!this.statusFilter) return this.orders();
    return this.orders().filter((o) => o.status === this.statusFilter);
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
  }

  getStatusCount(status: string): number {
    if (!status) return this.orders().length;
    return this.orders().filter((o) => o.status === status).length;
  }

  getStatusTranslationKey(status: string): string {
    if (!status) return 'DASHBOARD.ORDERS.ALL';
    return 'DASHBOARD.ORDERS.STATUS_' + status.toUpperCase();
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
}
