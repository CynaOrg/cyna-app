import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
type AvailabilityFilter = 'available' | 'unavailable';
type PriceFilter = 'under_100' | '100_500' | '500_plus';

interface ActivePill {
  type: 'availability' | 'price';
  value: string;
  label: string;
}

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
    <!-- Backdrop: closes overlays on outside click + blocks scroll/swipe -->
    @if (showFilterOverlay || showSortDropdown) {
      <div
        class="fixed inset-0 z-30 bg-black/30 sm:bg-transparent"
        (click)="closeAllOverlays()"
        (touchmove)="$event.preventDefault()"
        (wheel)="$event.preventDefault()"
      ></div>
    }

    <div
      [class]="
        compact()
          ? 'w-full max-w-7xl mx-auto px-4 sm:px-6 py-0'
          : 'w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10'
      "
    >
      @if (!hideHeader()) {
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

      <!-- ==================== COMPACT MODE (Dashboard) ==================== -->
      @if (compact()) {
        <!-- Toolbar: z-index below topbar (topbar is z-20, toolbar is z-10, overlays are z-40) -->
        <div
          class="flex items-center justify-between py-3 mb-3 relative"
          style="border-bottom: 1px solid #e5e5e5"
        >
          <!-- Filter button -->
          <div class="relative">
            <button
              (click)="$event.stopPropagation(); toggleFilterOverlay()"
              class="inline-flex items-center gap-2 py-2 text-sm font-medium transition-colors cursor-pointer"
              [style.color]="
                showFilterOverlay || activeFiltersCount > 0
                  ? '#4f39f6'
                  : '#0a0a0a'
              "
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
              {{ 'CATALOG.FILTERS' | translate }}
              @if (activeFiltersCount > 0) {
                <span
                  class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full"
                  style="background: #4f39f6; color: #fff"
                  >{{ activeFiltersCount }}</span
                >
              }
            </button>

            <!-- Filter overlay panel -->
            @if (showFilterOverlay) {
              <div
                class="fixed bottom-0 left-0 right-0 rounded-t-2xl pb-8
                       sm:absolute sm:bottom-auto sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-64 sm:rounded-xl sm:pb-5
                       p-5 space-y-5 z-40"
                style="
                  background: #ffffff;
                  border: 1px solid #e5e5e5;
                  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
                "
                (click)="$event.stopPropagation()"
              >
                <!-- Handle bar (mobile only) - tap to close -->
                <div
                  class="flex justify-center mb-2 sm:hidden -mt-1 pt-1 pb-2 cursor-pointer"
                  (click)="closeAllOverlays()"
                >
                  <span
                    class="w-10 h-1 rounded-full"
                    style="background: #d1d5db"
                  ></span>
                </div>
                <!-- Availability -->
                <div
                  style="
                    border-bottom: 1px solid #e5e5e5;
                    padding-bottom: 1.25rem;
                  "
                >
                  <p class="text-sm font-semibold mb-3" style="color: #0a0a0a">
                    {{ 'CATALOG.FILTER_AVAILABILITY' | translate }}
                  </p>
                  <div class="space-y-2.5">
                    @for (opt of availabilityOptions; track opt.value) {
                      <label class="flex items-center gap-2.5 cursor-pointer">
                        <span
                          class="w-4.5 h-4.5 rounded flex items-center justify-center transition-colors"
                          [attr.style]="
                            selectedAvailability.has(opt.value)
                              ? 'border:2px solid #4f39f6;background:#4f39f6'
                              : 'border:2px solid #e5e5e5;background:transparent'
                          "
                        >
                          @if (selectedAvailability.has(opt.value)) {
                            <svg
                              class="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="white"
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
                          type="checkbox"
                          [checked]="selectedAvailability.has(opt.value)"
                          (change)="toggleAvailability(opt.value)"
                          class="sr-only"
                        />
                        <span class="text-sm" style="color: #585858">{{
                          opt.label | translate
                        }}</span>
                      </label>
                    }
                  </div>
                </div>
                <!-- Price -->
                <div
                  style="
                    border-bottom: 1px solid #e5e5e5;
                    padding-bottom: 1.25rem;
                  "
                >
                  <p class="text-sm font-semibold mb-3" style="color: #0a0a0a">
                    {{ 'CATALOG.FILTER_PRICE' | translate }}
                  </p>
                  <div class="space-y-2.5">
                    @for (opt of priceOptions; track opt.value) {
                      <label class="flex items-center gap-2.5 cursor-pointer">
                        <span
                          class="w-4.5 h-4.5 rounded flex items-center justify-center transition-colors"
                          [attr.style]="
                            selectedPrices.has(opt.value)
                              ? 'border:2px solid #4f39f6;background:#4f39f6'
                              : 'border:2px solid #e5e5e5;background:transparent'
                          "
                        >
                          @if (selectedPrices.has(opt.value)) {
                            <svg
                              class="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="white"
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
                          type="checkbox"
                          [checked]="selectedPrices.has(opt.value)"
                          (change)="togglePrice(opt.value)"
                          class="sr-only"
                        />
                        <span class="text-sm" style="color: #585858">{{
                          opt.label | translate
                        }}</span>
                      </label>
                    }
                  </div>
                </div>
                @if (activeFiltersCount > 0) {
                  <button
                    (click)="clearAllFilters()"
                    class="text-xs font-medium"
                    style="color: #4f39f6"
                  >
                    {{ 'CATALOG.CLEAR_ALL' | translate }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Sort dropdown -->
          <div class="relative">
            <button
              (click)="$event.stopPropagation(); toggleSortDropdown()"
              class="inline-flex items-center gap-2 py-2 text-sm font-medium transition-colors cursor-pointer"
              [style.color]="
                showSortDropdown || currentSort !== 'default'
                  ? '#4f39f6'
                  : '#0a0a0a'
              "
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
                  d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
              {{ 'CATALOG.SORT_BY' | translate }}
              @if (currentSort !== 'default') {
                <span
                  class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full"
                  style="background: #4f39f6; color: #fff"
                  >1</span
                >
              }
            </button>
            @if (showSortDropdown) {
              <div
                class="fixed bottom-0 left-0 right-0 rounded-t-2xl pb-8
                       sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 sm:rounded-xl sm:pb-5
                       p-5 z-40"
                style="background-color: #ffffff; border: 1px solid #e5e5e5; box-shadow: 0 -4px 24px rgba(0,0,0,0.12)"
                (click)="$event.stopPropagation()"
              >
                <!-- Handle bar (mobile only) - tap to close -->
                <div
                  class="flex justify-center mb-2 sm:hidden -mt-1 pt-1 pb-2 cursor-pointer"
                  (click)="closeAllOverlays()"
                >
                  <span
                    class="w-10 h-1 rounded-full"
                    style="background: #d1d5db"
                  ></span>
                </div>
                <p class="text-sm font-semibold mb-3" style="color: #0a0a0a">
                  {{ 'CATALOG.SORT_BY' | translate }}
                </p>
                <div class="space-y-2.5">
                  @for (option of sortOptions; track option.value) {
                    <label
                      class="flex items-center gap-2.5 cursor-pointer"
                      (click)="setSortOption(option.value)"
                    >
                      <span
                        class="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        [attr.style]="
                          currentSort === option.value
                            ? 'border:2px solid #4f39f6;background:#4f39f6'
                            : 'border:2px solid #e5e5e5;background:transparent'
                        "
                      >
                        @if (currentSort === option.value) {
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            style="background:#ffffff"
                          ></span>
                        }
                      </span>
                      <span
                        class="text-sm"
                        [style.color]="
                          currentSort === option.value ? '#4f39f6' : '#585858'
                        "
                        [style.font-weight]="
                          currentSort === option.value ? '500' : '400'
                        "
                        >{{ option.label | translate }}</span
                      >
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Active filter pills -->
        @if (activePills.length > 0) {
          <div class="flex flex-wrap items-center gap-2 mb-5">
            @for (pill of activePills; track pill.value) {
              <span
                class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 text-xs font-medium
                       bg-primary/8 text-primary border border-primary/15 rounded-full"
              >
                {{ pill.label }}
                <button
                  (click)="removePill(pill)"
                  class="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full
                         hover:bg-primary/15 transition-colors"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            }
            <button
              (click)="clearAllFilters()"
              class="text-xs text-text-muted hover:text-primary font-medium transition-colors ml-1"
            >
              {{ 'CATALOG.CLEAR_ALL' | translate }}
            </button>
          </div>
        }

        <!-- Product grid (compact: no sidebar, always full width) -->
        <div class="w-full">
          @if (isLoading && products.length === 0) {
            <div
              class="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              @for (i of skeletonItems; track i) {
                <app-product-card-skeleton [fullWidth]="true" />
              }
            </div>
          } @else if (error) {
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
          } @else if (!isLoading && filteredProducts.length === 0) {
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
          } @else {
            <div
              class="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              @for (product of filteredProducts; track product.id) {
                <app-product-card
                  [product]="product"
                  [fullWidth]="true"
                  [routePrefix]="routePrefix()"
                />
              }
            </div>
            @if (pagination) {
              <app-pagination
                [currentPage]="pagination.page"
                [totalPages]="pagination.totalPages"
                (pageChange)="onPageChange($event)"
              />
            }
          }
        </div>
      }

      <!-- ==================== DEFAULT MODE (Guest / Storefront) ==================== -->
      @else {
        <!-- Toolbar: filters toggle + sort -->
        <div
          class="flex items-center justify-between py-4 border-b border-border mb-6 relative"
        >
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
          <div class="relative">
            <button
              (click)="$event.stopPropagation(); toggleSortDropdown()"
              class="inline-flex items-center gap-2 py-2 text-sm font-medium transition-colors cursor-pointer"
              [style.color]="
                showSortDropdown || currentSort !== 'default'
                  ? '#4f39f6'
                  : '#0a0a0a'
              "
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
                  d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
              {{ 'CATALOG.SORT_BY' | translate }}
              @if (currentSort !== 'default') {
                <span
                  class="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full"
                  style="background: #4f39f6; color: #fff"
                  >1</span
                >
              }
            </button>
            @if (showSortDropdown) {
              <div
                class="fixed bottom-0 left-0 right-0 rounded-t-2xl pb-8
                       sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 sm:rounded-xl sm:pb-5
                       p-5 z-40"
                style="background-color: #ffffff; border: 1px solid #e5e5e5; box-shadow: 0 -4px 24px rgba(0,0,0,0.12)"
                (click)="$event.stopPropagation()"
              >
                <!-- Handle bar (mobile only) - tap to close -->
                <div
                  class="flex justify-center mb-2 sm:hidden -mt-1 pt-1 pb-2 cursor-pointer"
                  (click)="closeAllOverlays()"
                >
                  <span
                    class="w-10 h-1 rounded-full"
                    style="background: #d1d5db"
                  ></span>
                </div>
                <p class="text-sm font-semibold mb-3" style="color: #0a0a0a">
                  {{ 'CATALOG.SORT_BY' | translate }}
                </p>
                <div class="space-y-2.5">
                  @for (option of sortOptions; track option.value) {
                    <label
                      class="flex items-center gap-2.5 cursor-pointer"
                      (click)="setSortOption(option.value)"
                    >
                      <span
                        class="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        [attr.style]="
                          currentSort === option.value
                            ? 'border:2px solid #4f39f6;background:#4f39f6'
                            : 'border:2px solid #e5e5e5;background:transparent'
                        "
                      >
                        @if (currentSort === option.value) {
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            style="background:#ffffff"
                          ></span>
                        }
                      </span>
                      <span
                        class="text-sm"
                        [style.color]="
                          currentSort === option.value ? '#4f39f6' : '#585858'
                        "
                        [style.font-weight]="
                          currentSort === option.value ? '500' : '400'
                        "
                        >{{ option.label | translate }}</span
                      >
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex gap-8">
          <!-- Sidebar filters -->
          @if (showFilters) {
            <aside class="hidden md:block w-56 shrink-0">
              <div class="sticky top-6 space-y-6">
                <!-- Availability -->
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
                    <div class="space-y-2.5">
                      @for (opt of availabilityOptions; track opt.value) {
                        <label
                          class="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <span
                            class="w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors"
                            [style.border-color]="
                              selectedAvailability.has(opt.value)
                                ? '#4f39f6'
                                : '#e5e5e5'
                            "
                            [style.background-color]="
                              selectedAvailability.has(opt.value)
                                ? '#4f39f6'
                                : 'transparent'
                            "
                          >
                            @if (selectedAvailability.has(opt.value)) {
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
                            type="checkbox"
                            [checked]="selectedAvailability.has(opt.value)"
                            (change)="toggleAvailability(opt.value)"
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
                <!-- Price -->
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
                    <div class="space-y-2.5">
                      @for (opt of priceOptions; track opt.value) {
                        <label
                          class="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <span
                            class="w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors"
                            [style.border-color]="
                              selectedPrices.has(opt.value)
                                ? '#4f39f6'
                                : '#e5e5e5'
                            "
                            [style.background-color]="
                              selectedPrices.has(opt.value)
                                ? '#4f39f6'
                                : 'transparent'
                            "
                          >
                            @if (selectedPrices.has(opt.value)) {
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
                            type="checkbox"
                            [checked]="selectedPrices.has(opt.value)"
                            (change)="togglePrice(opt.value)"
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

          <!-- Mobile filters -->
          @if (showFilters) {
            <div class="md:hidden w-full -mt-4 mb-4">
              <div
                class="bg-surface rounded-lg border border-border p-4 space-y-4"
              >
                <div>
                  <p class="text-xs font-semibold text-text-primary mb-2">
                    {{ 'CATALOG.FILTER_AVAILABILITY' | translate }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    @for (opt of availabilityOptions; track opt.value) {
                      <button
                        (click)="toggleAvailability(opt.value)"
                        class="px-3.5 py-1.5 text-xs rounded-full cursor-pointer transition-colors"
                        style="border: 1px solid #e5e5e5"
                        [style.background-color]="
                          selectedAvailability.has(opt.value)
                            ? '#4f39f6'
                            : 'transparent'
                        "
                        [style.color]="
                          selectedAvailability.has(opt.value)
                            ? '#ffffff'
                            : '#585858'
                        "
                        [style.border-color]="
                          selectedAvailability.has(opt.value)
                            ? '#4f39f6'
                            : '#e5e5e5'
                        "
                      >
                        {{ opt.label | translate }}
                      </button>
                    }
                  </div>
                </div>
                <div>
                  <p class="text-xs font-semibold text-text-primary mb-2">
                    {{ 'CATALOG.FILTER_PRICE' | translate }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    @for (opt of priceOptions; track opt.value) {
                      <button
                        (click)="togglePrice(opt.value)"
                        class="px-3.5 py-1.5 text-xs rounded-full cursor-pointer transition-colors"
                        style="border: 1px solid #e5e5e5"
                        [style.background-color]="
                          selectedPrices.has(opt.value)
                            ? '#4f39f6'
                            : 'transparent'
                        "
                        [style.color]="
                          selectedPrices.has(opt.value) ? '#ffffff' : '#585858'
                        "
                        [style.border-color]="
                          selectedPrices.has(opt.value) ? '#4f39f6' : '#e5e5e5'
                        "
                      >
                        {{ opt.label | translate }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Product grid -->
          <div class="flex-1 min-w-0">
            @if (isLoading && products.length === 0) {
              <div
                class="grid gap-5 grid-cols-1 sm:grid-cols-2"
                [class.lg:grid-cols-3]="showFilters"
                [class.lg:grid-cols-4]="!showFilters"
              >
                @for (i of skeletonItems; track i) {
                  <app-product-card-skeleton [fullWidth]="true" />
                }
              </div>
            } @else if (error) {
              <div
                class="flex flex-col items-center justify-center py-16 gap-4"
              >
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
            } @else if (!isLoading && filteredProducts.length === 0) {
              <div
                class="flex flex-col items-center justify-center py-16 gap-3"
              >
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
            } @else {
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
      }
    </div>
  `,
})
export class CatalogPageComponent implements OnInit {
  productType = input.required<ProductType>();
  title = input.required<string>();
  subtitle = input<string>();
  hideHeader = input<boolean>(false);
  routePrefix = input<string>();
  compact = input<boolean>(false);

  private readonly catalogStore = inject(CatalogStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly elRef = inject(ElementRef);

  hoveredSort: SortOption | null = null;

  get isOverlayOpen(): boolean {
    return this.showFilterOverlay || this.showSortDropdown;
  }

  closeAllOverlays(): void {
    this.showSortDropdown = false;
    this.showFilterOverlay = false;
    this.setScrollLock(false);
  }

  private setScrollLock(lock: boolean): void {
    // Disable scroll on the closest ion-content
    const ionContent = this.elRef.nativeElement.closest('ion-content');
    if (ionContent) {
      ionContent.scrollY = !lock;
    }
    // Also block body scroll for storefront pages
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  /** Close overlays on Escape key */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeAllOverlays();
  }

  products: Product[] = [];
  filteredProducts: Product[] = [];
  pagination: PaginatedMeta | null = null;
  isLoading = false;
  error: string | null = null;

  // UI state
  showFilters = true;
  showSortDropdown = false;
  showFilterOverlay = false;
  availabilityOpen = true;
  priceOpen = true;

  // Filter state (multi-select)
  currentSort: SortOption = 'default';
  selectedAvailability = new Set<AvailabilityFilter>();
  selectedPrices = new Set<PriceFilter>();

  // Active pills for compact mode
  activePills: ActivePill[] = [];
  activeFiltersCount = 0;

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'CATALOG.SORT_DEFAULT' },
    { value: 'price_asc', label: 'CATALOG.SORT_PRICE_ASC' },
    { value: 'price_desc', label: 'CATALOG.SORT_PRICE_DESC' },
    { value: 'name_asc', label: 'CATALOG.SORT_NAME_ASC' },
    { value: 'name_desc', label: 'CATALOG.SORT_NAME_DESC' },
  ];

  readonly availabilityOptions: {
    value: AvailabilityFilter;
    label: string;
  }[] = [
    { value: 'available', label: 'CATALOG.FILTER_AVAILABLE' },
    { value: 'unavailable', label: 'CATALOG.FILTER_UNAVAILABLE' },
  ];

  readonly priceOptions: { value: PriceFilter; label: string }[] = [
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

  toggleFilterOverlay(): void {
    this.showFilterOverlay = !this.showFilterOverlay;
    if (this.showFilterOverlay) this.showSortDropdown = false;
    this.setScrollLock(this.showFilterOverlay || this.showSortDropdown);
  }

  toggleSortDropdown(): void {
    this.showSortDropdown = !this.showSortDropdown;
    if (this.showSortDropdown) this.showFilterOverlay = false;
    this.setScrollLock(this.showFilterOverlay || this.showSortDropdown);
    this.hoveredSort = null;
  }

  setSortOption(sort: SortOption): void {
    this.currentSort = sort;
    this.showSortDropdown = false;
    this.setScrollLock(false);
    this.applyFiltersAndSort();
  }

  toggleAvailability(value: AvailabilityFilter): void {
    if (this.selectedAvailability.has(value)) {
      this.selectedAvailability.delete(value);
    } else {
      this.selectedAvailability.add(value);
    }
    this.applyFiltersAndSort();
  }

  togglePrice(value: PriceFilter): void {
    if (this.selectedPrices.has(value)) {
      this.selectedPrices.delete(value);
    } else {
      this.selectedPrices.add(value);
    }
    this.applyFiltersAndSort();
  }

  removePill(pill: ActivePill): void {
    if (pill.type === 'availability') {
      this.selectedAvailability.delete(pill.value as AvailabilityFilter);
    } else {
      this.selectedPrices.delete(pill.value as PriceFilter);
    }
    this.applyFiltersAndSort();
  }

  clearAllFilters(): void {
    this.selectedAvailability.clear();
    this.selectedPrices.clear();
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

    // Availability filter (multi-select: OR logic)
    if (this.selectedAvailability.size > 0) {
      result = result.filter((p) => {
        if (this.selectedAvailability.has('available') && p.isAvailable)
          return true;
        if (this.selectedAvailability.has('unavailable') && !p.isAvailable)
          return true;
        return false;
      });
    }

    // Price filter (multi-select: OR logic across ranges)
    if (this.selectedPrices.size > 0) {
      result = result.filter((p) => {
        const price = p.priceMonthly ?? p.priceUnit ?? 0;
        for (const range of this.selectedPrices) {
          switch (range) {
            case 'under_100':
              if (price > 0 && price < 100) return true;
              break;
            case '100_500':
              if (price >= 100 && price <= 500) return true;
              break;
            case '500_plus':
              if (price > 500) return true;
              break;
          }
        }
        return false;
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
    this.updatePills();
  }

  private updatePills(): void {
    const pills: ActivePill[] = [];

    for (const value of this.selectedAvailability) {
      const opt = this.availabilityOptions.find((o) => o.value === value);
      if (opt) {
        pills.push({
          type: 'availability',
          value,
          label: this.translate.instant(opt.label),
        });
      }
    }

    for (const value of this.selectedPrices) {
      const opt = this.priceOptions.find((o) => o.value === value);
      if (opt) {
        pills.push({
          type: 'price',
          value,
          label: this.translate.instant(opt.label),
        });
      }
    }

    this.activePills = pills;
    this.activeFiltersCount = pills.length;
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
