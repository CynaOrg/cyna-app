import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  host: { class: 'block' },
  template: `
    <a
      [routerLink]="computedRoute()"
      class="group block"
      style="text-decoration: none;"
    >
      <!-- Image — aspect square, fond neutre, pas d'overlay -->
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

      <!-- Content -->
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
export class ProductCardComponent {
  product = input.required<Product>();
  linkRoute = input<string>();
  routePrefix = input<string>();
  fullWidth = input<boolean>(false);

  computedRoute = computed(() => {
    const route = this.linkRoute();
    if (route) return route;
    const prefix = this.routePrefix() || '/products';
    return prefix + '/' + this.product().slug;
  });
}
