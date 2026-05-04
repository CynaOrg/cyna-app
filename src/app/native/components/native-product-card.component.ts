import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';

/**
 * Native-only product card.
 *
 * Mirrors the visual language of `app-product-card` from shared/, but with a
 * fixed width tuned for mobile horizontal scroll lanes (`w-44`). It is kept
 * inside `src/app/native/` so the web bundle can never import it.
 */
@Component({
  selector: 'app-native-product-card',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  host: { class: 'block' },
  template: `
    <a
      [routerLink]="computedRoute()"
      class="group block w-44 flex-shrink-0 snap-start"
      style="text-decoration: none;"
    >
      <div
        class="aspect-square w-full overflow-hidden rounded-lg"
        style="background: #f5f5f5;"
      >
        @if (product().primaryImageUrl) {
          <img
            [src]="product().primaryImageUrl"
            [alt]="product().name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        } @else {
          <div class="flex h-full w-full items-center justify-center">
            <svg
              class="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#d1d5db"
              stroke-width="1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          </div>
        }
      </div>

      <div class="mt-3">
        @if (product().categoryName) {
          <p class="text-xs font-medium" style="color: #9ca3af;">
            {{ product().categoryName }}
          </p>
        }

        <h3
          class="mt-1 text-sm font-medium leading-snug line-clamp-2"
          style="color: #0a0a0a;"
        >
          {{ product().name }}
        </h3>

        <div class="mt-1.5 flex items-baseline gap-1">
          @if (product().priceMonthly) {
            <span class="text-base font-semibold" style="color: #0a0a0a;">
              {{ product().priceMonthly }}&euro;
            </span>
            <span class="text-xs" style="color: #9ca3af;">
              {{ 'PRODUCT.PER_MONTH' | translate }} HT
            </span>
          } @else if (product().priceUnit) {
            <span class="text-base font-semibold" style="color: #0a0a0a;">
              {{ product().priceUnit }}&euro;
            </span>
            <span class="text-xs" style="color: #9ca3af;">HT</span>
          } @else {
            <span class="text-sm" style="color: #9ca3af;">
              {{ 'PRODUCT.ON_QUOTE' | translate }}
            </span>
          }
        </div>

        @if (!product().isAvailable) {
          <p class="mt-1 text-xs" style="color: #ef4444;">
            {{ 'PRODUCT.UNAVAILABLE' | translate }}
          </p>
        }
      </div>
    </a>
  `,
})
export class NativeProductCardComponent {
  product = input.required<Product>();
  routePrefix = input<string>('/m/products');

  computedRoute = computed(
    () => `${this.routePrefix()}/${this.product().slug}`,
  );
}
