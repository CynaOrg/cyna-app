import { Component, DestroyRef, OnInit, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  Product,
  ProductType,
  PaginatedMeta,
} from '@core/interfaces/product.interface';
import { CatalogStore } from '@core/stores/catalog.store';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../product-card-skeleton/product-card-skeleton.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    TranslateModule,
    ProductCardComponent,
    ProductCardSkeletonComponent,
    PaginationComponent,
  ],
  providers: [CatalogStore],
  template: `
    <div class="w-full max-w-7xl mx-auto px-6 py-8 sm:py-12">
      <!-- Header -->
      <div class="mb-8 sm:mb-10">
        <h1 class="text-2xl sm:text-3xl font-bold text-text-primary">
          {{ title() | translate }}
        </h1>
        @if (subtitle()) {
          <p class="mt-2 text-sm sm:text-base text-text-secondary max-w-2xl">
            {{ subtitle() | translate }}
          </p>
        }
      </div>

      <!-- Loading skeleton -->
      @if (isLoading && products.length === 0) {
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          @for (i of skeletonItems; track i) {
            <app-product-card-skeleton [fullWidth]="true" />
          }
        </div>
      }

      <!-- Error state -->
      @else if (error) {
        <div class="flex flex-col items-center justify-center py-16 gap-4">
          <div
            class="w-12 h-12 rounded-full bg-error-light flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p class="text-sm text-text-muted text-center">
            {{ 'CATALOG.ERROR' | translate }}
          </p>
          <button
            (click)="retry()"
            class="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-text-inverse hover:bg-primary-hover transition-colors"
          >
            {{ 'CATALOG.RETRY' | translate }}
          </button>
        </div>
      }

      <!-- Empty state -->
      @else if (!isLoading && products.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <p class="text-sm text-text-muted">
            {{ 'CATALOG.EMPTY' | translate }}
          </p>
        </div>
      }

      <!-- Product grid -->
      @else {
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          @for (product of products; track product.id) {
            <app-product-card [product]="product" [fullWidth]="true" />
          }
        </div>

        <!-- Pagination -->
        @if (pagination) {
          <app-pagination
            [currentPage]="pagination.page"
            [totalPages]="pagination.totalPages"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    </div>
  `,
})
export class CatalogPageComponent implements OnInit {
  productType = input.required<ProductType>();
  title = input.required<string>();
  subtitle = input<string>();

  private readonly catalogStore = inject(CatalogStore);
  private readonly destroyRef = inject(DestroyRef);

  products: Product[] = [];
  pagination: PaginatedMeta | null = null;
  isLoading = false;
  error: string | null = null;

  readonly skeletonItems = Array.from({ length: 12 }, (_, i) => i);
  private currentPage = 1;
  private readonly pageSize = 12;

  ngOnInit(): void {
    this.catalogStore.products$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => (this.products = products));

    this.catalogStore.pagination$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pagination) => (this.pagination = pagination));

    this.catalogStore.isLoading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => (this.isLoading = loading));

    this.catalogStore.error$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((error) => (this.error = error));

    this.fetchCurrentPage();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  retry(): void {
    this.fetchCurrentPage();
  }

  private fetchCurrentPage(): void {
    this.catalogStore
      .fetchPage({
        productType: this.productType(),
        page: this.currentPage,
        limit: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
