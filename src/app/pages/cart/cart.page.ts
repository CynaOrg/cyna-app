import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CartStore } from '@core/stores/cart.store';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  host: { class: 'ion-page' },
  standalone: false,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
})
export class CartPage implements OnInit {
  private readonly cartStore = inject(CartStore);
  private readonly location = inject(Location);
  private readonly alertController = inject(AlertController);
  private readonly translate = inject(TranslateService);
  private readonly header = inject(MobileHeaderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  isNative = isNativeCapacitor();
  /** Recomputed on every read so the cached page reflects the active URL. */
  get isDashboard(): boolean {
    return this.router.url.startsWith('/dashboard');
  }

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
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

  ionViewWillEnter(): void {
    if (this.isNative && !this.isDashboard) {
      this.header.configure({
        showBack: true,
        title: 'CART.TITLE',
        showSearch: true,
        actionIcon: this.isEmpty() ? null : 'phosphorTrash',
        actionLabel: 'Clear cart',
        actionDisabled: this.isEmpty(),
        visible: true,
      });
    } else {
      this.header.hide();
    }
  }

  constructor() {
    effect(() => {
      const empty = this.isEmpty();
      this.header.actionIcon.set(empty ? null : 'phosphorTrash');
      this.header.actionDisabled.set(empty);
    });

    this.header.actionClick$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.confirmClear());
  }

  ngOnInit(): void {
    // Action wiring done in constructor for injection-context APIs.
  }
}
