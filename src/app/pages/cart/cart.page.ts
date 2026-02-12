import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CartStore } from '@core/stores/cart.store';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  standalone: false,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
})
export class CartPage {
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  isNative = isNativeCapacitor();
  isDashboard = this.router.url.startsWith('/dashboard');

  items = toSignal(this.cartStore.items$, { initialValue: [] });
  count = toSignal(this.cartStore.count$, { initialValue: 0 });
  total = toSignal(this.cartStore.total$, { initialValue: 0 });
  isEmpty = toSignal(this.cartStore.isEmpty$, { initialValue: true });
  isLoading = toSignal(this.cartStore.isLoading$, { initialValue: false });
  error = toSignal(this.cartStore.error$, { initialValue: null });

  increment(productId: string, currentQty: number, maxQty: number): void {
    if (currentQty < maxQty) {
      this.cartStore.updateQuantity(productId, currentQty + 1);
    }
  }

  decrement(productId: string, currentQty: number): void {
    if (currentQty > 1) {
      this.cartStore.updateQuantity(productId, currentQty - 1);
    }
  }

  remove(productId: string): void {
    this.cartStore.removeItem(productId);
  }

  clearCart(): void {
    this.cartStore.clear();
  }

  goBack(): void {
    this.location.back();
  }
}
