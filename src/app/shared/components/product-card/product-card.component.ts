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
      class="group flex flex-col rounded-2xl bg-surface border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
      [style.width]="fullWidth() ? '100%' : '190px'"
    >
      <!-- Image - flush, compact -->
      <div class="relative w-full overflow-hidden" style="aspect-ratio: 3/2">
        @if (product().primaryImageUrl) {
          <img
            [src]="product().primaryImageUrl"
            [alt]="product().name"
            class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        } @else {
          <div
            class="w-full h-full flex items-center justify-center bg-border-light"
          >
            <span class="text-text-muted text-xs">{{
              'PRODUCT.NO_IMAGE_CARD' | translate
            }}</span>
          </div>
        }
        @if (product().categoryName) {
          <span
            class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/50 text-white backdrop-blur-sm"
          >
            {{ product().categoryName }}
          </span>
        }
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-1.5 p-3 flex-1">
        <div class="flex items-start justify-between gap-1.5">
          <h3
            class="font-semibold text-[13px] leading-snug text-text-primary line-clamp-2 flex-1"
          >
            {{ product().name }}
          </h3>
          <div
            class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
            [class.bg-success]="product().isAvailable"
            [class.bg-error]="!product().isAvailable"
          ></div>
        </div>

        @if (product().shortDescription) {
          <p class="text-xs leading-normal text-text-muted line-clamp-1">
            {{ product().shortDescription }}
          </p>
        }

        <!-- Price + CTA -->
        <div
          class="flex items-center justify-between mt-auto pt-2 border-t border-border/40"
        >
          <div class="flex items-baseline gap-0.5">
            @if (product().priceMonthly) {
              <span class="text-sm font-bold text-price"
                >{{ product().priceMonthly }}&euro;</span
              >
              <span class="text-[11px] text-text-muted">{{
                'PRODUCT.PER_MONTH' | translate
              }}</span>
            } @else if (product().priceUnit) {
              <span class="text-sm font-bold text-price"
                >{{ product().priceUnit }}&euro;</span
              >
            } @else {
              <span class="text-[11px] text-text-muted">{{
                'PRODUCT.ON_QUOTE' | translate
              }}</span>
            }
          </div>
          @if (product().isAvailable) {
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary text-text-inverse group-hover:bg-primary-hover transition-colors"
            >
              {{ 'PRODUCT.VIEW' | translate }}
            </span>
          } @else {
            <span class="text-[11px] text-text-muted">{{
              'PRODUCT.UNAVAILABLE' | translate
            }}</span>
          }
        </div>
      </div>
    </a>
  `,
})
export class ProductCardComponent {
  product = input.required<Product>();
  linkRoute = input<string>();
  fullWidth = input<boolean>(false);

  computedRoute = computed(() => {
    const route = this.linkRoute();
    if (route) {
      return route;
    }
    return '/products/' + this.product().slug;
  });
}
