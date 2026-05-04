import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';

/**
 * Native vertical 2-column product grid.
 *
 * Tailored to the catalog list pages (`/m/products`, `/m/services`,
 * `/m/licenses`). Cards stretch full column width — that is the difference
 * with `app-native-product-card`, which uses a fixed `w-44` for horizontal
 * carousels.
 */
@Component({
  selector: 'app-native-catalog-grid',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  host: { class: 'block w-full' },
  template: `
    @if (isLoading() && products().length === 0) {
      <div class="grid grid-cols-2 gap-3 px-4 pb-6 pt-4">
        @for (i of skeletonItems; track i) {
          <div>
            <div
              class="aspect-square w-full animate-pulse rounded-lg"
              style="background: #ececec;"
            ></div>
            <div
              class="mt-3 h-3 w-2/3 animate-pulse rounded"
              style="background: #ececec;"
            ></div>
            <div
              class="mt-2 h-4 w-1/2 animate-pulse rounded"
              style="background: #ececec;"
            ></div>
          </div>
        }
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <p class="text-sm" style="color: #585858">
          {{ 'CATALOG.ERROR' | translate }}
        </p>
      </div>
    } @else if (products().length === 0) {
      <div class="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <p class="text-sm" style="color: #585858">
          {{ 'CATALOG.EMPTY' | translate }}
        </p>
      </div>
    } @else {
      <div class="grid grid-cols-2 gap-3 px-4 pb-6 pt-4">
        @for (product of products(); track product.id) {
          <a
            [routerLink]="link(product.slug)"
            class="group block"
            style="text-decoration: none;"
          >
            <div
              class="aspect-square w-full overflow-hidden rounded-lg"
              style="background: #f5f5f5;"
            >
              @if (product.primaryImageUrl) {
                <img
                  [src]="product.primaryImageUrl"
                  [alt]="product.name"
                  class="h-full w-full object-cover transition-transform duration-300 group-active:scale-105"
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
              @if (product.categoryName) {
                <p class="text-xs font-medium" style="color: #9ca3af;">
                  {{ product.categoryName }}
                </p>
              }
              <h3
                class="mt-1 text-sm font-medium leading-snug line-clamp-2"
                style="color: #0a0a0a;"
              >
                {{ product.name }}
              </h3>
              <div class="mt-1.5 flex items-baseline gap-1">
                @if (product.priceMonthly) {
                  <span
                    class="text-base font-semibold"
                    style="color: #0a0a0a;"
                  >
                    {{ product.priceMonthly }}&euro;
                  </span>
                  <span class="text-xs" style="color: #9ca3af;">
                    {{ 'PRODUCT.PER_MONTH' | translate }} HT
                  </span>
                } @else if (product.priceUnit) {
                  <span
                    class="text-base font-semibold"
                    style="color: #0a0a0a;"
                  >
                    {{ product.priceUnit }}&euro;
                  </span>
                  <span class="text-xs" style="color: #9ca3af;">HT</span>
                } @else {
                  <span class="text-sm" style="color: #9ca3af;">
                    {{ 'PRODUCT.ON_QUOTE' | translate }}
                  </span>
                }
              </div>
              @if (!product.isAvailable) {
                <p class="mt-1 text-xs" style="color: #ef4444;">
                  {{ 'PRODUCT.UNAVAILABLE' | translate }}
                </p>
              }
            </div>
          </a>
        }
      </div>
    }
  `,
})
export class NativeCatalogGridComponent {
  products = input.required<Product[]>();
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  routePrefix = input<string>('/m/products');

  readonly skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  link(slug: string): string {
    return `${this.routePrefix()}/${slug}`;
  }
}
