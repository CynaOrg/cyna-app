import { Component, input, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../product-card-skeleton/product-card-skeleton.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ProductCardComponent,
    ProductCardSkeletonComponent,
    SectionHeaderComponent,
    TranslateModule,
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

      <!-- Skeleton state -->
      @if (isLoading()) {
        @if (variant() === 'mobile') {
          <div
            class="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar"
          >
            @for (i of skeletonItems; track i) {
              <app-product-card-skeleton class="flex-shrink-0 snap-start" />
            }
          </div>
        } @else {
          <div
            class="grid gap-3 grid-cols-2 sm:gap-5 md:gap-x-5 md:gap-y-8 lg:grid-cols-3 xl:grid-cols-4"
          >
            @for (i of skeletonItems; track i) {
              <app-product-card-skeleton [fullWidth]="true" />
            }
          </div>
        }
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
          <!-- Browser: 2-col grid on mobile, scales up on larger screens -->
          <div
            class="grid gap-3 grid-cols-2 sm:gap-5 md:gap-x-5 md:gap-y-8 lg:grid-cols-3 xl:grid-cols-4"
          >
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" [fullWidth]="true" />
            }
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

  readonly skeletonItems = [0, 1, 2, 3, 4, 5];
}
