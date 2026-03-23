import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ProductCardComponent,
    SectionHeaderComponent,
    TranslateModule,
    RouterLink,
  ],
  host: { class: 'block w-full' },
  template: `
    <div class="flex flex-col gap-4 w-full">
      <!-- Header (optional) -->
      @if (showHeader() && title()) {
        <app-section-header
          [title]="safeTitle()"
          [linkText]="linkText()"
          [linkRoute]="linkRoute()"
          [variant]="variant()"
        />
      }

      <!-- Loading state -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-8">
          <div
            class="w-6 h-6 border-2 rounded-full animate-spin"
            style="border-color: #e5e5e5; border-top-color: #4f39f6"
          ></div>
        </div>
      }

      <!-- Error state -->
      @else if (error()) {
        <p class="py-6 text-xs text-center text-text-muted">
          {{ 'PRODUCT_LIST.ERROR' | translate }}
        </p>
      }

      <!-- Empty state -->
      @else if (products().length === 0) {
        <p class="py-6 text-xs text-center text-text-muted">
          {{ 'PRODUCT_LIST.EMPTY' | translate }}
        </p>
      }

      <!-- Product list -->
      @else {
        @if (variant() === 'mobile') {
          <!-- Mobile native: horizontal scroll with snap -->
          <div
            class="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4
                   snap-x snap-mandatory hide-scrollbar"
          >
            @for (product of products(); track product.id) {
              <app-product-card
                [product]="product"
                class="flex-shrink-0 snap-start"
              />
            }
          </div>
        } @else {
          <!-- Browser: horizontal scroll on small screens, grid on md+ -->

          <!-- Mobile scroll (visible < md) -->
          <div
            class="flex gap-2.5 overflow-x-auto pb-2 pl-10
                   snap-x snap-mandatory hide-scrollbar md:hidden"
          >
            @for (product of products(); track product.id) {
              <app-product-card
                [product]="product"
                class="flex-shrink-0 snap-start"
              />
            }
            <!-- Right padding spacer -->
            <div class="shrink-0 w-6"></div>
          </div>

          <!-- Desktop grid (visible >= md) -->
          <div
            class="hidden md:grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" [fullWidth]="true" />
            }
          </div>
        }

        <!-- "Voir tout" link -->
        @if (linkRoute() && variant() === 'browser') {
          <div class="flex justify-center mt-4">
            <a
              [routerLink]="linkRoute()"
              class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary
                     border border-primary/20 rounded-full hover:bg-primary hover:text-white
                     transition-all duration-200"
            >
              {{ 'PRODUCT_LIST.SEE_ALL' | translate }}
              <svg
                class="w-4 h-4"
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
            </a>
          </div>
        }
      }
    </div>
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
export class ProductListComponent {
  products = input.required<Product[]>();
  title = input<string>();
  linkText = input<string>();
  linkRoute = input<string>();
  showHeader = input<boolean>(true);
  variant = input<'browser' | 'mobile'>('browser');
  isLoading = input<boolean>(false);
  error = input<string>();

  safeTitle = computed(() => this.title() ?? '');
}
