import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CartStore } from '@core/stores/cart.store';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  standalone: false,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
})
export class CartPage {
  private readonly cartStore = inject(CartStore);
  private readonly location = inject(Location);
  private readonly alertController = inject(AlertController);
  private readonly translate = inject(TranslateService);

  isNative = isNativeCapacitor();
  isDashboard = window.location.pathname.startsWith('/dashboard');
  scrolled = false;

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.scrolled = top > 0;
  }

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

  retry(): void {
    this.cartStore.loadCart();
  }

  async confirmClear(): Promise<void> {
    if (!this.items().length) return;

    const [header, message, cancel, confirm] = await Promise.all([
      this.translate.get('CART.CLEAR_CONFIRM_TITLE').toPromise(),
      this.translate.get('CART.CLEAR_CONFIRM_MESSAGE').toPromise(),
      this.translate.get('COMMON.CANCEL').toPromise(),
      this.translate.get('CART.CLEAR_CART').toPromise(),
    ]);

    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        { text: cancel, role: 'cancel' },
        {
          text: confirm,
          role: 'destructive',
          handler: () => this.cartStore.clear(),
        },
      ],
    });
    await alert.present();
  }

  goBack(): void {
    this.location.back();
  }
}
