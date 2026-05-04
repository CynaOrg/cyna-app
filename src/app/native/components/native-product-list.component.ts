import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';
import { NativeProductCardComponent } from './native-product-card.component';

/**
 * Native-only horizontal product carousel with optional section header.
 *
 * Counterpart of `app-product-list` for the `/m/*` route tree. Pinned to
 * mobile (snap-x, hidden scrollbar) and never reused by the web build.
 */
@Component({
  selector: 'app-native-product-list',
  standalone: true,
  imports: [NativeProductCardComponent, TranslateModule, RouterLink],
  host: { class: 'block w-full' },
  template: `
    <section class="flex w-full flex-col gap-4">
      @if (title()) {
        <header class="flex items-end justify-between px-4">
          <h2
            class="text-lg font-bold leading-tight"
            style="color: #0a0a0a;"
          >
            {{ title() }}
          </h2>
          @if (linkText() && linkRoute()) {
            <a
              [routerLink]="linkRoute()"
              class="text-sm font-medium"
              style="color: #4f39f6; text-decoration: none;"
            >
              {{ linkText() }}
            </a>
          }
        </header>
      }

      @if (isLoading()) {
        <div class="flex gap-2.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
          @for (i of skeletonItems; track i) {
            <div class="w-44 flex-shrink-0">
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
        <p class="px-4 py-6 text-xs text-text-muted">
          {{ 'PRODUCT_LIST.ERROR' | translate }}
        </p>
      } @else if (products().length === 0) {
        <p class="px-4 py-6 text-xs text-text-muted">
          {{ 'PRODUCT_LIST.EMPTY' | translate }}
        </p>
      } @else {
        <div
          class="flex gap-2.5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory hide-scrollbar"
        >
          @for (product of products(); track product.id) {
            <app-native-product-card
              [product]="product"
              [routePrefix]="routePrefix()"
            />
          }
          <div class="shrink-0 w-2"></div>
        </div>
      }
    </section>
  `,
  styles: `
    .hide-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `,
})
export class NativeProductListComponent {
  products = input.required<Product[]>();
  title = input<string>();
  linkText = input<string>();
  linkRoute = input<string>();
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  routePrefix = input<string>('/m/products');

  readonly skeletonItems = Array.from({ length: 4 }, (_, i) => i);
}
