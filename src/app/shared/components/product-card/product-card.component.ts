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
      class="group flex flex-col rounded-xl bg-surface border border-border/30
             shadow-sm hover:shadow-md hover:border-primary/25
             hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      [style.width]="fullWidth() ? '100%' : '160px'"
    >
      <!-- Image -->
      <div
        class="relative w-full overflow-hidden bg-border-light"
        style="aspect-ratio: 3/2"
      >
        @if (product().primaryImageUrl) {
          <img
            [src]="product().primaryImageUrl"
            [alt]="product().name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        } @else {
          <div class="w-full h-full flex items-center justify-center">
            <svg
              class="w-5 h-5 text-text-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          </div>
        }
        @if (product().categoryName) {
          <span
            class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px]
                   font-medium bg-black/55 text-white backdrop-blur-sm leading-normal"
          >
            {{ product().categoryName }}
          </span>
        }
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-0.5 p-2.5 flex-1">
        <h3
          class="font-semibold text-xs leading-snug text-text-primary line-clamp-2"
        >
          {{ product().name }}
        </h3>

        @if (product().shortDescription) {
          <p class="text-[11px] leading-normal text-text-muted line-clamp-1">
            {{ product().shortDescription }}
          </p>
        }

        <!-- Price + status -->
        <div class="flex items-center justify-between mt-auto pt-1.5">
          <div class="flex items-baseline gap-0.5">
            @if (product().priceMonthly) {
              <span class="text-[13px] font-bold text-price">
                {{ product().priceMonthly }}&euro;
              </span>
              <span class="text-[10px] text-text-muted">
                {{ 'PRODUCT.PER_MONTH' | translate }}
              </span>
            } @else if (product().priceUnit) {
              <span class="text-[13px] font-bold text-price">
                {{ product().priceUnit }}&euro;
              </span>
            } @else {
              <span class="text-[10px] text-text-muted italic">
                {{ 'PRODUCT.ON_QUOTE' | translate }}
              </span>
            }
          </div>

          <div class="flex items-center gap-1.5">
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              [class.bg-success]="product().isAvailable"
              [class.bg-error]="!product().isAvailable"
            ></span>
            <svg
              class="w-3.5 h-3.5 text-text-muted opacity-0 -translate-x-1
                     group-hover:opacity-100 group-hover:translate-x-0
                     transition-all duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </div>
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
