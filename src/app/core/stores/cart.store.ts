import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  firstValueFrom,
  map,
  distinctUntilChanged,
  filter,
  switchMap,
  catchError,
  EMPTY,
} from 'rxjs';
import { CartResponse, CartItemResponse } from '../interfaces/cart.interface';
import { CartApiService } from '../services/cart-api.service';
import { AuthStore } from './auth.store';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private readonly cartApi = inject(CartApiService);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  private readonly cartSubject$ = new BehaviorSubject<CartResponse | null>(
    null,
  );
  private readonly loadingSubject$ = new BehaviorSubject<boolean>(false);
  private readonly errorSubject$ = new BehaviorSubject<string | null>(null);

  private mergeTriggered = false;

  readonly cart$ = this.cartSubject$.asObservable();

  readonly items$: Observable<CartItemResponse[]> = this.cartSubject$.pipe(
    map((cart) => cart?.items ?? []),
    distinctUntilChanged(),
  );

  readonly count$: Observable<number> = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
    distinctUntilChanged(),
  );

  readonly total$: Observable<number> = this.items$.pipe(
    map((items) =>
      items.reduce((sum, item) => {
        const price =
          item.product?.priceUnit ?? item.product?.priceMonthly ?? 0;
        return sum + price * item.quantity;
      }, 0),
    ),
    distinctUntilChanged(),
  );

  readonly isEmpty$: Observable<boolean> = this.items$.pipe(
    map((items) => items.length === 0),
    distinctUntilChanged(),
  );

  readonly isLoading$ = this.loadingSubject$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly error$ = this.errorSubject$
    .asObservable()
    .pipe(distinctUntilChanged());

  constructor() {
    // On login: merge guest cart into user cart, then regenerate session_id
    this.authStore.isAuthenticated$
      .pipe(
        filter((isAuth) => isAuth && !this.mergeTriggered),
        switchMap(() => {
          this.mergeTriggered = true;
          return this.cartApi.mergeGuestCart().pipe(
            catchError(() => {
              // Merge failed (maybe no guest cart), just load user cart
              return this.cartApi.getCart().pipe(catchError(() => EMPTY));
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cart) => {
        this.cartSubject$.next(cart);
      });

    // On logout: reset cart state so next user/guest starts fresh
    this.authStore.isAuthenticated$
      .pipe(
        filter((isAuth) => !isAuth && this.mergeTriggered),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.mergeTriggered = false;
        this.cartSubject$.next(null);
        this.errorSubject$.next(null);
      });
  }

  loadCart(): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.cartApi
      .getCart()
      .pipe(
        catchError((err) => {
          this.setTranslatedError(err?.error?.message, 'CART.LOAD_ERROR');
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe((cart) => {
        this.cartSubject$.next(cart);
        this.loadingSubject$.next(false);
      });
  }

  addItem(productId: string, quantity = 1, billingPeriod?: string): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.cartApi
      .addItem({ productId, quantity, billingPeriod })
      .pipe(
        catchError((err) => {
          this.errorSubject$.next(err?.error?.message || 'Failed to add item');
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe((cart) => {
        this.cartSubject$.next(cart);
        this.loadingSubject$.next(false);
      });
  }

  updateQuantity(
    productId: string,
    quantity: number,
    billingPeriod?: string,
  ): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.cartApi
      .updateItem(productId, quantity, billingPeriod)
      .pipe(
        catchError((err) => {
          this.errorSubject$.next(
            err?.error?.message || 'Failed to update item',
          );
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe((cart) => {
        this.cartSubject$.next(cart);
        this.loadingSubject$.next(false);
      });
  }

  removeItem(productId: string, billingPeriod?: string): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.cartApi
      .removeItem(productId, billingPeriod)
      .pipe(
        catchError((err) => {
          this.errorSubject$.next(
            err?.error?.message || 'Failed to remove item',
          );
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe((cart) => {
        this.cartSubject$.next(cart);
        this.loadingSubject$.next(false);
      });
  }

  private setTranslatedError(
    serverMessage: string | undefined,
    fallbackKey: string,
  ): void {
    if (serverMessage) {
      this.errorSubject$.next(serverMessage);
    } else {
      firstValueFrom(this.translate.get(fallbackKey)).then((msg) =>
        this.errorSubject$.next(msg),
      );
    }
  }

  clear(): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.cartApi
      .clearCart()
      .pipe(
        catchError((err) => {
          this.errorSubject$.next(
            err?.error?.message || 'Failed to clear cart',
          );
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.cartSubject$.next(null);
        this.loadingSubject$.next(false);
      });
  }
}
