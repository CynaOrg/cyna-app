import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderApiService } from '@core/services/order-api.service';
import { catchError, EMPTY } from 'rxjs';

interface LicenseInfo {
  productName: string;
  licenseKey: string;
  status: string;
  orderId: string;
}

@Component({
  standalone: false,
  selector: 'app-dashboard-licenses',
  templateUrl: './licenses.page.html',
})
export class DashboardLicensesPage implements OnInit {
  private readonly orderApi = inject(OrderApiService);

  licenses = signal<LicenseInfo[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  copiedKey: string | null = null;

  ngOnInit(): void {
    this.orderApi
      .getOrders()
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message || 'Failed to load licenses');
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((orders) => {
        const licenseList: LicenseInfo[] = [];
        for (const order of orders) {
          for (const item of order.items) {
            if (item.productName?.toLowerCase().includes('license')) {
              licenseList.push({
                productName: item.productName,
                licenseKey: `CYNA-${order.id.substring(0, 4).toUpperCase()}-XXXX-XXXX-XXXX`,
                status:
                  order.status === 'paid' || order.status === 'completed'
                    ? 'active'
                    : 'pending',
                orderId: order.id,
              });
            }
          }
        }
        this.licenses.set(licenseList);
        this.isLoading.set(false);
      });
  }

  copyKey(key: string): void {
    navigator.clipboard.writeText(key);
    this.copiedKey = key;
    setTimeout(() => {
      this.copiedKey = null;
    }, 2000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#34c759';
      case 'revoked':
        return '#ff383c';
      case 'expired':
        return '#9ca3af';
      default:
        return '#ff9500';
    }
  }
}
