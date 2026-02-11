import { Injectable, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Subject,
  Observable,
  combineLatest,
  of,
  EMPTY,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  catchError,
  tap,
} from 'rxjs/operators';
import { ProductService } from './product.service';
import { Product, ProductType } from '../interfaces/product.interface';

export interface SearchState {
  results: Product[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  hasSearched: boolean;
}

export interface GroupedResults {
  type: ProductType;
  labelKey: string;
  products: Product[];
}

const INITIAL_STATE: SearchState = {
  results: [],
  isLoading: false,
  error: null,
  totalResults: 0,
  hasSearched: false,
};

const MAX_RECENT_SEARCHES = 5;

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly state$ = new BehaviorSubject<SearchState>(INITIAL_STATE);
  private readonly isOpen$ = new BehaviorSubject<boolean>(false);
  private readonly searchTerm$ = new Subject<string>();
  private readonly activeFilter$ = new BehaviorSubject<ProductType | null>(
    null,
  );
  private readonly recentSearches: string[] = [];

  readonly isOpen = this.isOpen$.asObservable();
  readonly results$ = this.state$.pipe(map((s) => s.results));
  readonly isLoading$ = this.state$.pipe(map((s) => s.isLoading));
  readonly error$ = this.state$.pipe(map((s) => s.error));
  readonly totalResults$ = this.state$.pipe(map((s) => s.totalResults));
  readonly hasSearched$ = this.state$.pipe(map((s) => s.hasSearched));
  readonly filter$ = this.activeFilter$.asObservable();

  readonly groupedResults$: Observable<GroupedResults[]> = this.results$.pipe(
    map((products) => {
      const groups: { type: ProductType; labelKey: string }[] = [
        { type: 'saas', labelKey: 'SEARCH.GROUP_SERVICES' },
        { type: 'physical', labelKey: 'SEARCH.GROUP_PRODUCTS' },
        { type: 'license', labelKey: 'SEARCH.GROUP_LICENSES' },
      ];
      return groups
        .map((g) => ({
          ...g,
          products: products.filter((p) => p.productType === g.type),
        }))
        .filter((g) => g.products.length > 0);
    }),
  );

  constructor() {
    this.setupSearchPipeline();
  }

  private setupSearchPipeline(): void {
    combineLatest([
      this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()),
      this.activeFilter$,
    ])
      .pipe(
        tap(([term]) => {
          if (term.trim().length === 0) {
            this.state$.next({ ...INITIAL_STATE });
            return;
          }
          this.state$.next({
            ...this.state$.value,
            isLoading: true,
            error: null,
          });
        }),
        switchMap(([term, productType]) => {
          if (term.trim().length === 0) return EMPTY;
          return this.productService
            .getProducts({
              search: term,
              productType: productType ?? undefined,
              limit: 20,
            })
            .pipe(
              catchError(() => {
                this.state$.next({
                  ...this.state$.value,
                  isLoading: false,
                  error: 'SEARCH.ERROR',
                  hasSearched: true,
                });
                return EMPTY;
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.state$.next({
          results: response.data,
          isLoading: false,
          error: null,
          totalResults: response.meta.total,
          hasSearched: true,
        });
      });
  }

  open(): void {
    this.isOpen$.next(true);
  }

  close(): void {
    this.isOpen$.next(false);
    this.reset();
  }

  toggle(): void {
    if (this.isOpen$.value) {
      this.close();
    } else {
      this.open();
    }
  }

  search(term: string): void {
    this.searchTerm$.next(term);
  }

  setFilter(type: ProductType | null): void {
    this.activeFilter$.next(type);
  }

  addRecentSearch(term: string): void {
    const trimmed = term.trim();
    if (!trimmed) return;
    const idx = this.recentSearches.indexOf(trimmed);
    if (idx > -1) this.recentSearches.splice(idx, 1);
    this.recentSearches.unshift(trimmed);
    if (this.recentSearches.length > MAX_RECENT_SEARCHES) {
      this.recentSearches.pop();
    }
  }

  getRecentSearches(): string[] {
    return [...this.recentSearches];
  }

  clearRecentSearches(): void {
    this.recentSearches.length = 0;
  }

  selectResult(product: Product): void {
    this.close();
    this.router.navigate(['/products', product.slug]);
  }

  private reset(): void {
    this.state$.next(INITIAL_STATE);
    this.activeFilter$.next(null);
  }
}
