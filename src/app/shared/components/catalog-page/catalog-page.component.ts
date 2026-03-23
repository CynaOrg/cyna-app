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

type SortOption =
  | 'default'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';
type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type PriceFilter = 'all' | 'under_100' | '100_500' | '500_plus';

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
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      @if (!hideHeader()) {
        <!-- Header row: title + count -->
        <div class="mb-2">
          <h1
            class="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight"
          >
            {{ title() | translate }}
            @if (!isLoading && filteredProducts.length > 0) {
              <span class="text-text-muted font-normal"
                >({{ filteredProducts.length }})</span
              >
            }
          </h1>
          @if (subtitle()) {
            <p class="mt-1.5 text-sm text-text-secondary max-w-2xl">
              {{ subtitle() | translate }}
            </p>
          }
        </div>
      }

      <!-- Toolbar: filters toggle + sort -->
      <div
        class="flex items-center justify-between py-4 border-b border-border mb-6"
      >
        <!-- Left: toggle filters -->
        <button
          (click)="toggleFilters()"
          class="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors"
        >
          <svg
            class="w-4.5 h-4.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
          @if (showFilters) {
            {{ 'CATALOG.HIDE_FILTERS' | translate }}
          } @else {
            {{ 'CATALOG.SHOW_FILTERS' | translate }}
          }
        </button>

        <!-- Right: sort dropdown -->
        <div class="relative">
          <button
            (click)="toggleSortDropdown()"
            class="flex items-center gap-1.5 text-sm font-medium text-text-primary hover:text-primary transition-colors"
          >
            {{ 'CATALOG.SORT_BY' | translate }}
            <svg
              class="w-4 h-4 transition-transform"
              [class.rotate-180]="showSortDropdown"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          @if (showSortDropdown) {
            <!-- Backdrop -->
            <div
              class="fixed inset-0 z-10"
              (click)="showSortDropdown = false"
            ></div>
            <!-- Dropdown -->
            <div
              class="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg border border-border shadow-lg z-20 py-1 overflow-hidden"
            >
              @for (option of sortOptions; track option.value) {
                <button
                  (click)="setSortOption(option.value)"
                  class="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  [class.text-primary]="currentSort === option.value"
                  [class.font-medium]="currentSort === option.value"
                  [class.bg-primary-light]="currentSort === option.value"
                  [class.text-text-primary]="currentSort !== option.value"
                  [class.hover:bg-border-light]="currentSort !== option.value"
                >
                  {{ option.label | translate }}
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Main layout: sidebar + grid -->
      <div class="flex gap-8">
        <!-- Filter sidebar -->
        @if (showFilters) {
          <aside class="hidden md:block w-56 shrink-0">
            <div class="sticky top-6 space-y-6">
              <!-- Availability filter -->
              <div class="border-b border-border pb-5">
                <button
                  (click)="availabilityOpen = !availabilityOpen"
                  class="flex items-center justify-between w-full text-sm font-semibold text-text-primary mb-3"
                >
                  {{ 'CATALOG.FILTER_AVAILABILITY' | translate }}
                  <svg
                    class="w-4 h-4 transition-transform"
                    [class.rotate-180]="!availabilityOpen"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                @if (availabilityOpen) {
                  <div class="space-y-2">
                    @for (opt of availabilityOptions; track opt.value) {
                      <label
                        class="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <span
                          class="w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors"
                          [class.border-primary]="
                            currentAvailability === opt.value
                          "
                          [class.bg-primary]="currentAvailability === opt.value"
                          [class.border-border]="
                            currentAvailability !== opt.value
                          "
                          [class.group-hover:border-primary/50]="
                            currentAvailability !== opt.value
                          "
                        >
                          @if (currentAvailability === opt.value) {
                            <svg
                              class="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          }
                        </span>
                        <input
                          type="radio"
                          name="availability"
                          [value]="opt.value"
                          [checked]="currentAvailability === opt.value"
                          (change)="setAvailability(opt.value)"
                          class="sr-only"
                        />
                        <span
                          class="text-sm text-text-secondary group-hover:text-text-primary transition-colors"
                        >
                          {{ opt.label | translate }}
                        </span>
                      </label>
                    }
                  </div>
                }
              </div>

              <!-- Price filter -->
              <div class="border-b border-border pb-5">
                <button
                  (click)="priceOpen = !priceOpen"
                  class="flex items-center justify-between w-full text-sm font-semibold text-text-primary mb-3"
                >
                  {{ 'CATALOG.FILTER_PRICE' | translate }}
                  <svg
                    class="w-4 h-4 transition-transform"
                    [class.rotate-180]="!priceOpen"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                @if (priceOpen) {
                  <div class="space-y-2">
                    @for (opt of priceOptions; track opt.value) {
                      <label
                        class="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <span
                          class="w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors"
                          [class.border-primary]="currentPrice === opt.value"
                          [class.bg-primary]="currentPrice === opt.value"
                          [class.border-border]="currentPrice !== opt.value"
                          [class.group-hover:border-primary/50]="
                            currentPrice !== opt.value
                          "
                        >
                          @if (currentPrice === opt.value) {
                            <svg
                              class="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="3"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          }
                        </span>
                        <input
                          type="radio"
                          name="price"
                          [value]="opt.value"
                          [checked]="currentPrice === opt.value"
                          (change)="setPriceFilter(opt.value)"
                          class="sr-only"
                        />
                        <span
                          class="text-sm text-text-secondary group-hover:text-text-primary transition-colors"
                        >
                          {{ opt.label | translate }}
                        </span>
                      </label>
                    }
                  </div>
                }
              </div>
            </div>
          </aside>
        }

        <!-- Mobile filters (collapsible top panel) -->
        @if (showFilters) {
          <div class="md:hidden w-full -mt-4 mb-4">
            <div
              class="bg-surface rounded-lg border border-border p-4 space-y-4"
            >
              <!-- Availability -->
              <div>
                <p class="text-xs font-semibold text-text-primary mb-2">
                  {{ 'CATALOG.FILTER_AVAILABILITY' | translate }}
                </p>
                <div class="flex flex-wrap gap-2">
                  @for (opt of availabilityOptions; track opt.value) {
                    <button
                      (click)="setAvailability(opt.value)"
                      class="px-3 py-1.5 text-xs rounded-full border transition-colors"
                      [class.bg-primary]="currentAvailability === opt.value"
                      [class.text-white]="currentAvailability === opt.value"
                      [class.border-primary]="currentAvailability === opt.value"
                      [class.bg-transparent]="currentAvailability !== opt.value"
                      [class.text-text-secondary]="
                        currentAvailability !== opt.value
                      "
                      [class.border-border]="currentAvailability !== opt.value"
                    >
                      {{ opt.label | translate }}
                    </button>
                  }
                </div>
              </div>
              <!-- Price -->
              <div>
                <p class="text-xs font-semibold text-text-primary mb-2">
                  {{ 'CATALOG.FILTER_PRICE' | translate }}
                </p>
                <div class="flex flex-wrap gap-2">
                  @for (opt of priceOptions; track opt.value) {
                    <button
                      (click)="setPriceFilter(opt.value)"
                      class="px-3 py-1.5 text-xs rounded-full border transition-colors"
                      [class.bg-primary]="currentPrice === opt.value"
                      [class.text-white]="currentPrice === opt.value"
                      [class.border-primary]="currentPrice === opt.value"
                      [class.bg-transparent]="currentPrice !== opt.value"
                      [class.text-text-secondary]="currentPrice !== opt.value"
                      [class.border-border]="currentPrice !== opt.value"
                    >
                      {{ opt.label | translate }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Product grid area -->
        <div class="flex-1 min-w-0">
          <!-- Loading skeleton -->
          @if (isLoading && products.length === 0) {
            <div
              class="grid gap-5"
              [class.grid-cols-1]="true"
              [class.sm:grid-cols-2]="true"
              [class.lg:grid-cols-3]="showFilters"
              [class.lg:grid-cols-4]="!showFilters"
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
          @else if (!isLoading && filteredProducts.length === 0) {
            <div class="flex flex-col items-center justify-center py-16 gap-3">
              <svg
                class="w-12 h-12 text-text-muted/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p class="text-sm text-text-muted">
                {{ 'CATALOG.EMPTY' | translate }}
              </p>
            </div>
          }

          <!-- Product grid -->
          @else {
            <div
              class="grid gap-5 grid-cols-1 sm:grid-cols-2"
              [class.lg:grid-cols-3]="showFilters"
              [class.lg:grid-cols-4]="!showFilters"
            >
              @for (product of filteredProducts; track product.id) {
                <app-product-card
                  [product]="product"
                  [fullWidth]="true"
                  [routePrefix]="routePrefix()"
                />
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
      </div>
    </div>
  `,
})
export class CatalogPageComponent implements OnInit {
  productType = input.required<ProductType>();
  title = input.required<string>();
  subtitle = input<string>();
  hideHeader = input<boolean>(false);
  routePrefix = input<string>();

  private readonly catalogStore = inject(CatalogStore);
  private readonly destroyRef = inject(DestroyRef);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  pagination: PaginatedMeta | null = null;
  isLoading = false;
  error: string | null = null;

  // UI state
  showFilters = true;
  showSortDropdown = false;
  availabilityOpen = true;
  priceOpen = true;

  // Filter state
  currentSort: SortOption = 'default';
  currentAvailability: AvailabilityFilter = 'all';
  currentPrice: PriceFilter = 'all';

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'CATALOG.SORT_DEFAULT' },
    { value: 'price_asc', label: 'CATALOG.SORT_PRICE_ASC' },
    { value: 'price_desc', label: 'CATALOG.SORT_PRICE_DESC' },
    { value: 'name_asc', label: 'CATALOG.SORT_NAME_ASC' },
    { value: 'name_desc', label: 'CATALOG.SORT_NAME_DESC' },
  ];

  readonly availabilityOptions: { value: AvailabilityFilter; label: string }[] =
    [
      { value: 'all', label: 'CATALOG.FILTER_ALL' },
      { value: 'available', label: 'CATALOG.FILTER_AVAILABLE' },
      { value: 'unavailable', label: 'CATALOG.FILTER_UNAVAILABLE' },
    ];

  readonly priceOptions: { value: PriceFilter; label: string }[] = [
    { value: 'all', label: 'CATALOG.FILTER_PRICE_ALL' },
    { value: 'under_100', label: 'CATALOG.FILTER_PRICE_UNDER_100' },
    { value: '100_500', label: 'CATALOG.FILTER_PRICE_100_500' },
    { value: '500_plus', label: 'CATALOG.FILTER_PRICE_500_PLUS' },
  ];

  readonly skeletonItems = Array.from({ length: 12 }, (_, i) => i);
  private currentPage = 1;
  private readonly pageSize = 20;

  ngOnInit(): void {
    this.catalogStore.products$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.products = products;
        this.applyFiltersAndSort();
      });

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

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSortDropdown(): void {
    this.showSortDropdown = !this.showSortDropdown;
  }

  setSortOption(sort: SortOption): void {
    this.currentSort = sort;
    this.showSortDropdown = false;
    this.applyFiltersAndSort();
  }

  setAvailability(filter: AvailabilityFilter): void {
    this.currentAvailability = filter;
    this.applyFiltersAndSort();
  }

  setPriceFilter(filter: PriceFilter): void {
    this.currentPrice = filter;
    this.applyFiltersAndSort();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  retry(): void {
    this.fetchCurrentPage();
  }

  private applyFiltersAndSort(): void {
    let result = [...this.products];

    // Availability filter
    if (this.currentAvailability === 'available') {
      result = result.filter((p) => p.isAvailable);
    } else if (this.currentAvailability === 'unavailable') {
      result = result.filter((p) => !p.isAvailable);
    }

    // Price filter
    if (this.currentPrice !== 'all') {
      result = result.filter((p) => {
        const price = p.priceMonthly ?? p.priceUnit ?? 0;
        switch (this.currentPrice) {
          case 'under_100':
            return price > 0 && price < 100;
          case '100_500':
            return price >= 100 && price <= 500;
          case '500_plus':
            return price > 500;
          default:
            return true;
        }
      });
    }

    // Sort
    switch (this.currentSort) {
      case 'price_asc':
        result.sort(
          (a, b) =>
            (a.priceMonthly ?? a.priceUnit ?? 0) -
            (b.priceMonthly ?? b.priceUnit ?? 0),
        );
        break;
      case 'price_desc':
        result.sort(
          (a, b) =>
            (b.priceMonthly ?? b.priceUnit ?? 0) -
            (a.priceMonthly ?? a.priceUnit ?? 0),
        );
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    this.filteredProducts = result;
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
