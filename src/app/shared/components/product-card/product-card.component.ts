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
      class="group flex flex-col rounded-xl bg-surface overflow-hidden
             hover:-translate-y-1 transition-all duration-300"
      [style.width]="fullWidth() ? '100%' : '180px'"
    >
      <!-- Image -->
      <div
        class="relative w-full overflow-hidden bg-border-light"
        [style.aspect-ratio]="fullWidth() ? '4/3' : '3/2'"
      >
        @if (product().primaryImageUrl) {
          <img
            [src]="product().primaryImageUrl"
            [alt]="product().name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        } @else {
          <div
            class="w-full h-full flex items-center justify-center bg-border-light"
          >
            <svg
              class="w-8 h-8 text-text-muted/25"
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
            class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px]
                   font-medium bg-black/50 text-white backdrop-blur-sm leading-normal"
          >
            {{ product().categoryName }}
          </span>
        }
      </div>

      <!-- Content -->
      <div
        class="flex flex-col gap-1 flex-1"
        [class.p-3]="!fullWidth()"
        [class.p-4]="fullWidth()"
      >
        <h3
          class="font-semibold text-text-primary line-clamp-2 leading-snug"
          [class.text-sm]="!fullWidth()"
          [class.text-base]="fullWidth()"
        >
          {{ product().name }}
        </h3>

        @if (product().shortDescription) {
          <p
            class="text-text-muted line-clamp-1 leading-normal"
            [class.text-xs]="!fullWidth()"
            [class.text-sm]="fullWidth()"
          >
            {{ product().shortDescription }}
          </p>
        }

        <!-- Price + status -->
        <div class="flex items-center justify-between mt-auto pt-2">
          <div class="flex items-baseline gap-1">
            @if (product().priceMonthly) {
              <span
                class="font-bold text-primary"
                [class.text-sm]="!fullWidth()"
                [class.text-base]="fullWidth()"
              >
                {{ product().priceMonthly }}&euro;
              </span>
              <span class="text-xs text-text-muted">
                {{ 'PRODUCT.PER_MONTH' | translate }}
              </span>
            } @else if (product().priceUnit) {
              <span
                class="font-bold text-primary"
                [class.text-sm]="!fullWidth()"
                [class.text-base]="fullWidth()"
              >
                {{ product().priceUnit }}&euro;
              </span>
            } @else {
              <span class="text-xs text-text-muted italic">
                {{ 'PRODUCT.ON_QUOTE' | translate }}
              </span>
            }
          </div>

          <div class="flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              [class.bg-success]="product().isAvailable"
              [class.bg-error]="!product().isAvailable"
            ></span>
            <svg
              class="w-4 h-4 text-text-muted opacity-0 -translate-x-1
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
