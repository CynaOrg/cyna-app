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
