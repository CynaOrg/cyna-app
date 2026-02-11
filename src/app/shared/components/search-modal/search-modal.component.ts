import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMagnifyingGlass,
  phosphorX,
  phosphorClockCounterClockwise,
  phosphorArrowElbowDownLeft,
} from '@ng-icons/phosphor-icons/regular';
import { AnimationController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SearchService, GroupedResults } from '@core/services/search.service';
import { ProductType, Product } from '@core/interfaces/product.interface';
import { SearchResultItemComponent } from './search-result-item.component';
import { SearchResultSkeletonComponent } from './search-result-skeleton.component';

interface FilterOption {
  type: ProductType | null;
  labelKey: string;
}

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    NgIconComponent,
    TranslateModule,
    SearchResultItemComponent,
    SearchResultSkeletonComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorMagnifyingGlass,
      phosphorX,
      phosphorClockCounterClockwise,
      phosphorArrowElbowDownLeft,
    }),
  ],
  template: `
    @if (isOpen()) {
      <!-- MOBILE LAYOUT (<640px) -->
      @if (isMobile()) {
        <!-- Backdrop -->
        <div
          #mobileBackdrop
          class="fixed inset-0 z-[100] bg-black/40"
          (click)="close()"
        ></div>

        <!-- Bottom Sheet -->
        <div
          #mobileSheet
          class="fixed inset-x-0 bottom-0 z-[101] flex max-h-[85vh] flex-col rounded-t-2xl bg-surface shadow-2xl"
        >
          <!-- Handle bar -->
          <div class="flex justify-center pt-3 pb-2">
            <div class="h-1 w-10 rounded-full bg-border"></div>
          </div>

          <!-- Search input -->
          <div class="flex items-center gap-3 border-b border-border px-4 pb-3">
            <ng-icon
              name="phosphorMagnifyingGlass"
              size="20"
              class="shrink-0"
              style="color: #9ca3af"
            />
            <input
              #searchInputMobile
              type="text"
              class="flex-1 bg-transparent text-base outline-none placeholder:text-text-muted"
              style="color: #0a0a0a"
              [placeholder]="'SEARCH.PLACEHOLDER' | translate"
              (input)="onSearchInput($event)"
              (keydown.escape)="close()"
            />
            @if (currentTerm()) {
              <button
                type="button"
                class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-border-light"
                (click)="clearInput()"
              >
                <ng-icon name="phosphorX" size="14" style="color: #9ca3af" />
              </button>
            }
          </div>

          <!-- Filter chips -->
          <div class="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
            @for (f of filters; track f.type) {
              <button
                type="button"
                class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                [class.bg-primary]="activeFilter() === f.type"
                [class.text-white]="activeFilter() === f.type"
                [class.bg-border-light]="activeFilter() !== f.type"
                [style.color]="activeFilter() !== f.type ? '#585858' : ''"
                (click)="setFilter(f.type)"
              >
                {{ f.labelKey | translate }}
              </button>
            }
          </div>

          <!-- Results area -->
          <div class="flex-1 overflow-y-auto px-2 pb-4">
            @if (!hasSearched() && !isLoading() && !currentTerm()) {
              <!-- Recent searches -->
              @if (recentSearches().length > 0) {
                <div class="flex items-center justify-between px-4 py-2">
                  <span class="text-xs font-medium" style="color: #9ca3af">
                    {{ 'SEARCH.RECENT' | translate }}
                  </span>
                  <button
                    type="button"
                    class="text-xs font-medium"
                    style="color: #4f39f6"
                    (click)="clearRecentSearches()"
                  >
                    {{ 'SEARCH.CLEAR' | translate }}
                  </button>
                </div>
                @for (term of recentSearches(); track term) {
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-colors hover:bg-border-light"
                    (click)="applyRecentSearch(term)"
                  >
                    <ng-icon
                      name="phosphorClockCounterClockwise"
                      size="16"
                      style="color: #9ca3af"
                    />
                    <span class="text-sm" style="color: #0a0a0a">{{
                      term
                    }}</span>
                  </button>
                }
              } @else {
                <div class="px-4 py-8 text-center">
                  <p class="text-sm" style="color: #9ca3af">
                    {{ 'SEARCH.INITIAL_HINT' | translate }}
                  </p>
                </div>
              }
            } @else if (isLoading()) {
              @for (i of [1, 2, 3, 4]; track i) {
                <app-search-result-skeleton />
              }
            } @else if (error()) {
              <div class="px-4 py-8 text-center">
                <p class="text-sm" style="color: #ff383c">
                  {{ 'SEARCH.ERROR' | translate }}
                </p>
              </div>
            } @else if (hasSearched() && groupedResults().length === 0) {
              <div class="px-4 py-8 text-center">
                <p class="text-sm font-medium" style="color: #0a0a0a">
                  {{ 'SEARCH.NO_RESULTS' | translate }}
                </p>
                <p class="mt-1 text-xs" style="color: #9ca3af">
                  {{ 'SEARCH.NO_RESULTS_HINT' | translate }}
                </p>
              </div>
            } @else {
              @for (group of groupedResults(); track group.type) {
                <div class="mt-2">
                  <div class="px-4 py-1.5">
                    <span
                      class="text-[11px] font-semibold uppercase tracking-wider"
                      style="color: #9ca3af"
                    >
                      {{ group.labelKey | translate }}
                    </span>
                  </div>
                  @for (
                    product of group.products;
                    track product.id;
                    let idx = $index
                  ) {
                    <app-search-result-item
                      [product]="product"
                      [isActive]="flatIndex(group, idx) === activeIndex()"
                      (selected)="selectResult($event)"
                    />
                  }
                </div>
              }
            }
          </div>
        </div>
      } @else {
        <!-- DESKTOP LAYOUT (>=640px) -->
        <!-- Backdrop -->
        <div
          #desktopBackdrop
          class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          (click)="close()"
        ></div>

        <!-- Modal -->
        <div
          #desktopModal
          class="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh]"
          (click)="close()"
        >
          <div
            class="mx-4 flex max-h-[60vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
            (click)="$event.stopPropagation()"
          >
            <!-- Search input -->
            <div
              class="flex items-center gap-3 border-b border-border px-5 py-4"
            >
              <ng-icon
                name="phosphorMagnifyingGlass"
                size="20"
                class="shrink-0"
                style="color: #9ca3af"
              />
              <input
                #searchInputDesktop
                type="text"
                class="flex-1 bg-transparent text-base outline-none placeholder:text-text-muted"
                style="color: #0a0a0a"
                [placeholder]="'SEARCH.PLACEHOLDER' | translate"
                (input)="onSearchInput($event)"
                (keydown.escape)="close()"
                (keydown.arrowdown)="onArrowDown($event)"
                (keydown.arrowup)="onArrowUp($event)"
                (keydown.enter)="onEnter($event)"
              />
              @if (currentTerm()) {
                <button
                  type="button"
                  class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-border-light"
                  (click)="clearInput()"
                >
                  <ng-icon name="phosphorX" size="14" style="color: #9ca3af" />
                </button>
              }
              <kbd
                class="rounded border border-border bg-background px-1.5 py-0.5 text-[11px]"
                style="color: #9ca3af"
              >
                Esc
              </kbd>
            </div>

            <!-- Filter chips -->
            <div class="flex gap-2 border-b border-border/50 px-5 py-3">
              @for (f of filters; track f.type) {
                <button
                  type="button"
                  class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  [class.bg-primary]="activeFilter() === f.type"
                  [class.text-white]="activeFilter() === f.type"
                  [class.bg-border-light]="activeFilter() !== f.type"
                  [style.color]="activeFilter() !== f.type ? '#585858' : ''"
                  (click)="setFilter(f.type)"
                >
                  {{ f.labelKey | translate }}
                </button>
              }
            </div>

            <!-- Results area -->
            <div class="flex-1 overflow-y-auto px-2 py-2">
              @if (!hasSearched() && !isLoading() && !currentTerm()) {
                <!-- Recent searches -->
                @if (recentSearches().length > 0) {
                  <div class="flex items-center justify-between px-4 py-2">
                    <span class="text-xs font-medium" style="color: #9ca3af">
                      {{ 'SEARCH.RECENT' | translate }}
                    </span>
                    <button
                      type="button"
                      class="text-xs font-medium"
                      style="color: #4f39f6"
                      (click)="clearRecentSearches()"
                    >
                      {{ 'SEARCH.CLEAR' | translate }}
                    </button>
                  </div>
                  @for (term of recentSearches(); track term) {
                    <button
                      type="button"
                      class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-colors hover:bg-border-light"
                      (click)="applyRecentSearch(term)"
                    >
                      <ng-icon
                        name="phosphorClockCounterClockwise"
                        size="16"
                        style="color: #9ca3af"
                      />
                      <span class="text-sm" style="color: #0a0a0a">{{
                        term
                      }}</span>
                    </button>
                  }
                } @else {
                  <div class="px-4 py-8 text-center">
                    <p class="text-sm" style="color: #9ca3af">
                      {{ 'SEARCH.INITIAL_HINT' | translate }}
                    </p>
                  </div>
                }
              } @else if (isLoading()) {
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <app-search-result-skeleton />
                }
              } @else if (error()) {
                <div class="px-4 py-8 text-center">
                  <p class="text-sm" style="color: #ff383c">
                    {{ 'SEARCH.ERROR' | translate }}
                  </p>
                </div>
              } @else if (hasSearched() && groupedResults().length === 0) {
                <div class="px-4 py-8 text-center">
                  <p class="text-sm font-medium" style="color: #0a0a0a">
                    {{ 'SEARCH.NO_RESULTS' | translate }}
                  </p>
                  <p class="mt-1 text-xs" style="color: #9ca3af">
                    {{ 'SEARCH.NO_RESULTS_HINT' | translate }}
                  </p>
                </div>
              } @else {
                @for (group of groupedResults(); track group.type) {
                  <div class="mt-2 first:mt-0">
                    <div class="px-4 py-1.5">
                      <span
                        class="text-[11px] font-semibold uppercase tracking-wider"
                        style="color: #9ca3af"
                      >
                        {{ group.labelKey | translate }}
                      </span>
                    </div>
                    @for (
                      product of group.products;
                      track product.id;
                      let idx = $index
                    ) {
                      <app-search-result-item
                        [product]="product"
                        [isActive]="flatIndex(group, idx) === activeIndex()"
                        (selected)="selectResult($event)"
                      />
                    }
                  </div>
                }
              }
            </div>

            <!-- Footer -->
            @if (hasSearched() && totalResults() > 0) {
              <div
                class="flex items-center justify-between border-t border-border px-5 py-3"
              >
                <span class="text-xs" style="color: #9ca3af">
                  {{ totalResults() }}
                  {{ 'SEARCH.RESULTS_COUNT' | translate }}
                </span>
                <div class="flex items-center gap-3">
                  <span
                    class="flex items-center gap-1 text-[11px]"
                    style="color: #9ca3af"
                  >
                    <kbd
                      class="rounded border border-border bg-background px-1 py-0.5 text-[10px]"
                      >↑↓</kbd
                    >
                    {{ 'SEARCH.NAVIGATE' | translate }}
                  </span>
                  <span
                    class="flex items-center gap-1 text-[11px]"
                    style="color: #9ca3af"
                  >
                    <kbd
                      class="rounded border border-border bg-background px-1 py-0.5 text-[10px]"
                      >↵</kbd
                    >
                    {{ 'SEARCH.SELECT' | translate }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    }
  `,
  styles: `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `,
})
export class SearchModalComponent implements OnInit {
  private readonly searchService = inject(SearchService);
  private readonly animationCtrl = inject(AnimationController);
  private readonly destroyRef = inject(DestroyRef);

  searchInputMobile = viewChild<ElementRef>('searchInputMobile');
  searchInputDesktop = viewChild<ElementRef>('searchInputDesktop');
  mobileBackdrop = viewChild<ElementRef>('mobileBackdrop');
  mobileSheet = viewChild<ElementRef>('mobileSheet');
  desktopBackdrop = viewChild<ElementRef>('desktopBackdrop');
  desktopModal = viewChild<ElementRef>('desktopModal');

  isOpen = signal(false);
  isMobile = signal(false);
  currentTerm = signal('');
  activeIndex = signal(-1);
  recentSearches = signal<string[]>([]);

  isLoading = toSignal(this.searchService.isLoading$, { initialValue: false });
  error = toSignal(this.searchService.error$, { initialValue: null });
  hasSearched = toSignal(this.searchService.hasSearched$, {
    initialValue: false,
  });
  totalResults = toSignal(this.searchService.totalResults$, {
    initialValue: 0,
  });
  groupedResults = toSignal(this.searchService.groupedResults$, {
    initialValue: [] as GroupedResults[],
  });
  activeFilter = toSignal(this.searchService.filter$, { initialValue: null });

  filters: FilterOption[] = [
    { type: null, labelKey: 'SEARCH.ALL' },
    { type: 'saas', labelKey: 'SEARCH.SERVICES' },
    { type: 'physical', labelKey: 'SEARCH.PRODUCTS' },
    { type: 'license', labelKey: 'SEARCH.LICENSES' },
  ];

  ngOnInit(): void {
    this.searchService.isOpen
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((open) => {
        if (open) {
          this.openModal();
        } else if (this.isOpen()) {
          this.closeModal();
        }
      });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchService.toggle();
    }
  }

  private openModal(): void {
    this.isMobile.set(window.innerWidth < 640);
    this.isOpen.set(true);
    this.recentSearches.set(this.searchService.getRecentSearches());

    requestAnimationFrame(() => {
      this.focusInput();
      this.playOpenAnimation();
    });
  }

  private async closeModal(): Promise<void> {
    if (this.currentTerm().trim()) {
      this.searchService.addRecentSearch(this.currentTerm().trim());
    }

    await this.playCloseAnimation();
    this.isOpen.set(false);
    this.currentTerm.set('');
    this.activeIndex.set(-1);
  }

  close(): void {
    this.searchService.close();
  }

  private focusInput(): void {
    const input = this.isMobile()
      ? this.searchInputMobile()
      : this.searchInputDesktop();
    input?.nativeElement.focus();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentTerm.set(value);
    this.activeIndex.set(-1);
    this.searchService.search(value);
  }

  clearInput(): void {
    this.currentTerm.set('');
    this.searchService.search('');
    this.focusInput();
  }

  setFilter(type: ProductType | null): void {
    this.searchService.setFilter(type);
    if (this.currentTerm().trim()) {
      this.searchService.search(this.currentTerm());
    }
  }

  applyRecentSearch(term: string): void {
    this.currentTerm.set(term);
    this.searchService.search(term);
    // Update the input element value
    const input = this.isMobile()
      ? this.searchInputMobile()
      : this.searchInputDesktop();
    if (input) input.nativeElement.value = term;
    this.focusInput();
  }

  clearRecentSearches(): void {
    this.searchService.clearRecentSearches();
    this.recentSearches.set([]);
  }

  selectResult(product: Product): void {
    if (this.currentTerm().trim()) {
      this.searchService.addRecentSearch(this.currentTerm().trim());
    }
    this.searchService.selectResult(product);
  }

  flatIndex(group: GroupedResults, localIdx: number): number {
    const groups = this.groupedResults();
    let offset = 0;
    for (const g of groups) {
      if (g.type === group.type) return offset + localIdx;
      offset += g.products.length;
    }
    return -1;
  }

  private get flatResults(): Product[] {
    const results: Product[] = [];
    for (const g of this.groupedResults()) {
      results.push(...g.products);
    }
    return results;
  }

  onArrowDown(event: Event): void {
    event.preventDefault();
    const max = this.flatResults.length - 1;
    if (max < 0) return;
    this.activeIndex.update((i) => (i < max ? i + 1 : 0));
  }

  onArrowUp(event: Event): void {
    event.preventDefault();
    const max = this.flatResults.length - 1;
    if (max < 0) return;
    this.activeIndex.update((i) => (i > 0 ? i - 1 : max));
  }

  onEnter(event: Event): void {
    event.preventDefault();
    const idx = this.activeIndex();
    const flat = this.flatResults;
    if (idx >= 0 && idx < flat.length) {
      this.selectResult(flat[idx]);
    }
  }

  private async playOpenAnimation(): Promise<void> {
    if (this.isMobile()) {
      const backdrop = this.mobileBackdrop()?.nativeElement;
      const sheet = this.mobileSheet()?.nativeElement;
      if (!backdrop || !sheet) return;

      const backdropAnim = this.animationCtrl
        .create()
        .addElement(backdrop)
        .duration(300)
        .easing('ease-out')
        .fromTo('opacity', '0', '1');

      const sheetAnim = this.animationCtrl
        .create()
        .addElement(sheet)
        .duration(300)
        .easing('ease-out')
        .fromTo('transform', 'translateY(100%)', 'translateY(0)');

      await this.animationCtrl
        .create()
        .addAnimation([backdropAnim, sheetAnim])
        .play();
    } else {
      const backdrop = this.desktopBackdrop()?.nativeElement;
      const modal = this.desktopModal()?.nativeElement;
      if (!backdrop || !modal) return;

      const backdropAnim = this.animationCtrl
        .create()
        .addElement(backdrop)
        .duration(200)
        .easing('ease-out')
        .fromTo('opacity', '0', '1');

      const modalAnim = this.animationCtrl
        .create()
        .addElement(modal)
        .duration(250)
        .easing('ease-out')
        .fromTo('opacity', '0', '1')
        .fromTo(
          'transform',
          'scale(0.98) translateY(-8px)',
          'scale(1) translateY(0)',
        );

      await this.animationCtrl
        .create()
        .addAnimation([backdropAnim, modalAnim])
        .play();
    }
  }

  private async playCloseAnimation(): Promise<void> {
    if (this.isMobile()) {
      const backdrop = this.mobileBackdrop()?.nativeElement;
      const sheet = this.mobileSheet()?.nativeElement;
      if (!backdrop || !sheet) return;

      const backdropAnim = this.animationCtrl
        .create()
        .addElement(backdrop)
        .duration(250)
        .easing('ease-in')
        .fromTo('opacity', '1', '0');

      const sheetAnim = this.animationCtrl
        .create()
        .addElement(sheet)
        .duration(250)
        .easing('ease-in')
        .fromTo('transform', 'translateY(0)', 'translateY(100%)');

      await this.animationCtrl
        .create()
        .addAnimation([backdropAnim, sheetAnim])
        .play();
    }
    // Desktop: instant close (no animation), like NextJS/Angular.dev
  }
}
