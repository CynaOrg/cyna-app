import { Component, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CartItemResponse } from '@core/interfaces/cart.interface';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe, TranslateModule],
  template: `
    <div class="flex flex-col gap-4 rounded-xl bg-surface p-6">
      <h3 class="text-base font-semibold text-text-primary">
        {{ 'CHECKOUT.ORDER_SUMMARY' | translate }}
      </h3>

      <div class="flex flex-col gap-3">
        @for (item of items(); track item.productId) {
          <div class="flex items-center justify-between gap-2">
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-medium text-text-primary truncate">
                {{ item.product?.nameFr ?? 'Product' }}
              </span>
              <span class="text-xs text-text-muted">
                {{ 'CHECKOUT.QTY' | translate }}: {{ item.quantity }}
              </span>
            </div>
            <span class="text-sm font-semibold text-text-primary shrink-0">
              {{ getItemPrice(item) | number: '1.2-2' }}&euro;
            </span>
          </div>
        }
      </div>

      <div class="border-t border-border/30 pt-3 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-text-muted">{{
            'CHECKOUT.SUBTOTAL' | translate
          }}</span>
          <span class="text-sm font-medium text-text-primary"
            >{{ subtotal() | number: '1.2-2' }}&euro;</span
          >
        </div>

        @if (showShipping()) {
          <div class="flex items-center justify-between">
            <span class="text-sm text-text-muted">{{
              'CHECKOUT.SHIPPING' | translate
            }}</span>
            <span class="text-sm font-medium text-text-primary">{{
              'CHECKOUT.FREE' | translate
            }}</span>
          </div>
        }
      </div>

      <div class="border-t border-border/30 pt-3">
        <div class="flex items-center justify-between">
          <span class="text-base font-semibold text-text-primary">{{
            'CHECKOUT.TOTAL' | translate
          }}</span>
          <span class="text-xl font-bold text-primary"
            >{{ total() | number: '1.2-2' }}&euro;</span
          >
        </div>
      </div>
    </div>
  `,
})
export class OrderSummaryComponent {
  items = input<CartItemResponse[]>([]);
  subtotal = input(0);
  total = input(0);
  showShipping = input(false);

  getItemPrice(item: CartItemResponse): number {
    const price = item.product?.priceUnit ?? item.product?.priceMonthly ?? 0;
    return price * item.quantity;
  }
}
