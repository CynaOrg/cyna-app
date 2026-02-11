import { Component, input, computed } from '@angular/core';
import { Product } from '@core/interfaces/product.interface';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, SectionHeaderComponent],
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
            class="w-8 h-8 border-4 rounded-full animate-spin"
            style="border-color: #e5e5e5; border-top-color: #4f39f6"
          ></div>
        </div>
      }

      <!-- Error state -->
      @else if (error()) {
        <p class="py-6 text-sm text-center" style="color: #9ca3af">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      }

      <!-- Empty state -->
      @else if (products().length === 0) {
        <p class="py-6 text-sm text-center" style="color: #9ca3af">
          Aucun produit disponible pour le moment.
        </p>
      }

      <!-- Product list -->
      @else {
        @if (variant() === 'mobile') {
          <!-- Mobile native: horizontal scroll -->
          <div
            class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar"
          >
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" class="flex-shrink-0" />
            }
          </div>
        } @else {
          <!-- Browser: horizontal scroll on small screens, grid on md+ -->
          <!-- Mobile scroll (visible < md) -->
          <div
            class="flex gap-3 overflow-x-auto pb-2 hide-scrollbar md:hidden pl-10"
          >
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" class="flex-shrink-0" />
            }
            <!-- Spacer to add right padding at end of scroll -->
            <div class="shrink-0 w-6"></div>
          </div>
          <!-- Desktop grid (visible >= md) -->
          <div class="hidden md:grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
  linkText = input<string>('Voir tout');
  linkRoute = input<string>();
  showHeader = input<boolean>(true);
  variant = input<'browser' | 'mobile'>('browser');
  isLoading = input<boolean>(false);
  error = input<string>();

  safeTitle = computed(() => this.title() ?? '');
}
