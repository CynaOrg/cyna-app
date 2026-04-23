import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  EMPTY,
  catchError,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Address } from '../interfaces';
import { CheckoutApiService } from '../services/checkout-api.service';
import { CreatePaymentIntentRequest } from '../api';

export interface CheckoutState {
  email: string;
  billingAddress: Address | null;
  shippingAddress: Address | null;
  clientSecret: string | null;
  paymentIntentId: string | null;
  orderId: string | null;
  orderNumber: string | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: CheckoutState = {
  email: '',
  billingAddress: null,
  shippingAddress: null,
  clientSecret: null,
  paymentIntentId: null,
  orderId: null,
  orderNumber: null,
  isLoading: false,
  error: null,
};

@Injectable()
export class CheckoutStore {
  private readonly checkoutApi = inject(CheckoutApiService);
  private readonly translate = inject(TranslateService);

  private readonly state$ = new BehaviorSubject<CheckoutState>(INITIAL_STATE);

  readonly email$ = this.state$.pipe(
    map((s) => s.email),
    distinctUntilChanged(),
  );
  readonly clientSecret$ = this.state$.pipe(
    map((s) => s.clientSecret),
    distinctUntilChanged(),
  );
  readonly paymentIntentId$ = this.state$.pipe(
    map((s) => s.paymentIntentId),
    distinctUntilChanged(),
  );
  readonly isLoading$ = this.state$.pipe(
    map((s) => s.isLoading),
    distinctUntilChanged(),
  );
  readonly error$ = this.state$.pipe(
    map((s) => s.error),
    distinctUntilChanged(),
  );

  get state(): CheckoutState {
    return this.state$.getValue();
  }

  setEmail(email: string): void {
    this.state$.next({ ...this.state, email });
  }

  setBillingAddress(address: Address): void {
    this.state$.next({ ...this.state, billingAddress: address });
  }

  setShippingAddress(address: Address | null): void {
    this.state$.next({ ...this.state, shippingAddress: address });
  }

  createPaymentIntent(cartId: string): void {
    const { email, billingAddress, shippingAddress } = this.state;
    if (!billingAddress) {
      this.state$.next({ ...this.state, error: 'Billing address is required' });
      return;
    }
    if (!email) {
      this.state$.next({ ...this.state, error: 'Email is required' });
      return;
    }

    this.state$.next({ ...this.state, isLoading: true, error: null });

    const lang =
      this.translate.currentLang || this.translate.defaultLang || 'fr';
    const preferredLanguage: CreatePaymentIntentRequest['preferredLanguage'] =
      lang === 'en' ? 'en' : 'fr';

    this.checkoutApi
      .createPaymentIntent({
        cartId,
        email,
        billingAddress,
        shippingAddress: shippingAddress ?? undefined,
        preferredLanguage,
      })
      .pipe(
        catchError((err) => {
          this.state$.next({
            ...this.state,
            isLoading: false,
            error: err?.error?.message || 'Failed to create payment',
          });
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.state$.next({
          ...this.state,
          clientSecret: response.clientSecret,
          paymentIntentId: response.paymentIntentId,
          orderId: response.orderId,
          orderNumber: response.orderNumber,
          isLoading: false,
          error: null,
        });
      });
  }

  reset(): void {
    this.state$.next(INITIAL_STATE);
  }
}
