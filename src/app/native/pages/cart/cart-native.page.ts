import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMinus,
  phosphorPlus,
  phosphorShoppingCart,
  phosphorTrash,
  phosphorWarningCircle,
} from '@ng-icons/phosphor-icons/regular';
import { CartItemResponse } from '@core/interfaces/cart.interface';
import { CartStore } from '@core/stores/cart.store';
import { NativePageHeaderComponent } from '../../components/native-page-header.component';
import {
  PullToRefreshComponent,
} from '../../components/pull-to-refresh.component';
import { SkeletonListComponent } from '../../components/skeleton-list.component';
import { HapticOnDirective } from '../../directives/haptic-on.directive';

/**
 * Native cart page mounted at `/m/cart`.
 *
 * Mirrors the storefront `CartPage` (mobile branch) but lives entirely under
 * `src/app/native/`. Adds:
 * - native back button via `NativePageHeaderComponent`,
 * - pull-to-refresh that re-fetches the cart from the backend,
 * - haptic feedback (medium) on the sticky checkout CTA,
 * - explicit display of the "récurrent" vs "one-time" split when the cart is
 *   mixed (SaaS subscription items + physical / license items together), per
 *   the cadrage Phase 2 §4.1.
 */
@Component({
  selector: 'app-cart-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterLink,
    NgIconComponent,
    NativePageHeaderComponent,
    PullToRefreshComponent,
    SkeletonListComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({
      phosphorMinus,
      phosphorPlus,
      phosphorShoppingCart,
      phosphorTrash,
      phosphorWarningCircle,
    }),
  ],
  templateUrl: './cart-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartNativePage implements OnInit {
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(PullToRefreshComponent) refresher?: PullToRefreshComponent;

  readonly items = toSignal(this.cartStore.items$, { initialValue: [] });
  readonly count = toSignal(this.cartStore.count$, { initialValue: 0 });
  readonly total = toSignal(this.cartStore.total$, { initialValue: 0 });
  readonly isEmpty = toSignal(this.cartStore.isEmpty$, { initialValue: true });
  readonly isLoading = toSignal(this.cartStore.isLoading$, {
    initialValue: false,
  });
  readonly error = toSignal(this.cartStore.error$, { initialValue: null });

  /** SaaS / subscription items billed monthly or yearly. */
  readonly recurringItems = computed(() =>
    this.items().filter((i) => i.product?.productType === 'saas'),
  );

  /** One-time items (physical, license). */
  readonly oneTimeItems = computed(() =>
    this.items().filter(
      (i) => i.product && i.product.productType !== 'saas',
    ),
  );

  readonly recurringTotal = computed(() =>
    this.recurringItems().reduce((s, i) => s + this.itemPrice(i) * i.quantity, 0),
  );

  readonly oneTimeTotal = computed(() =>
    this.oneTimeItems().reduce((s, i) => s + this.itemPrice(i) * i.quantity, 0),
  );

  /** True when the cart mixes recurring SaaS with one-time products. */
  readonly isMixed = computed(
    () => this.recurringItems().length > 0 && this.oneTimeItems().length > 0,
  );

  ngOnInit(): void {
    this.cartStore.loadCart();
  }

  itemPrice(item: CartItemResponse): number {
    return item.product?.priceUnit ?? item.product?.priceMonthly ?? 0;
  }

  increment(item: CartItemResponse): void {
    const max = item.product?.stockQuantity ?? 99;
    if (item.quantity < max) {
      this.cartStore.updateQuantity(item.productId, item.quantity + 1);
    }
  }

  decrement(item: CartItemResponse): void {
    if (item.quantity > 1) {
      this.cartStore.updateQuantity(item.productId, item.quantity - 1);
    }
  }

  remove(item: CartItemResponse): void {
    this.cartStore.removeItem(item.productId);
  }

  clearCart(): void {
    this.cartStore.clear();
  }

  onRefresh(): void {
    this.cartStore.loadCart();
    // Best-effort: complete the spinner once the loading flag flips back.
    this.cartStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        if (!loading) void this.refresher?.complete();
      });
  }

  goToCheckout(): void {
    this.router.navigateByUrl('/m/checkout');
  }
}
