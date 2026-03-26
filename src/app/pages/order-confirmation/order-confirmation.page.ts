import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OrderApiService } from '@core/services/order-api.service';
import { Order } from '@core/interfaces';
import { AuthStore } from '@core/stores/auth.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  standalone: false,
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.page.html',
})
export class OrderConfirmationPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderApi = inject(OrderApiService);
  private readonly authStore = inject(AuthStore);

  isNative = isNativeCapacitor();
  isDashboard = this.router.url.startsWith('/dashboard');

  order = signal<Order | null>(null);
  isLoading = signal(true);
  isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    // Try to use navigation state first (works for guest checkout)
    const navState =
      this.router.getCurrentNavigation()?.extras?.state || history.state;

    if (navState?.orderNumber) {
      // Build order from navigation state
      const items = (navState.items || []).map((item: any) => ({
        id: item.productId,
        productId: item.productId,
        productSnapshot: {
          name: item.product?.nameFr || item.product?.nameEn || 'Product',
          nameEn: item.product?.nameEn,
          nameFr: item.product?.nameFr,
          image: item.product?.images?.[0]?.url || null,
        },
        quantity: item.quantity,
        unitPrice: item.product?.priceUnit || item.product?.priceMonthly || 0,
        totalPrice:
          (item.product?.priceUnit || item.product?.priceMonthly || 0) *
          item.quantity,
      }));

      this.order.set({
        id,
        orderNumber: navState.orderNumber,
        userId: null,
        guestEmail: null,
        items,
        subtotal: navState.total || 0,
        total: navState.total || 0,
        status: 'pending',
        billingAddressSnapshot: {},
        createdAt: new Date().toISOString(),
      });
      this.isLoading.set(false);
      return;
    }

    // Fallback: fetch from API (authenticated users only)
    this.orderApi
      .getOrderById(id)
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((order) => {
        this.order.set(order);
        this.isLoading.set(false);
      });
  }

  hasLicenseItems(): boolean {
    return (
      this.order()?.items?.some((item) =>
        item.productSnapshot?.name?.toLowerCase().includes('license'),
      ) ?? false
    );
  }

  hasPhysicalItems(): boolean {
    return (
      this.order()?.items?.some(
        (item) => item.productSnapshot?.productType === 'physical',
      ) ?? false
    );
  }
}
