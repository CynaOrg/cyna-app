import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  EMPTY,
  Subscription as RxSubscription,
  catchError,
  firstValueFrom,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from '../interfaces';
import { SubscriptionApiService } from '../services/subscription-api.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionStore {
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly translate = inject(TranslateService);

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

  private readonly subscriptionsSubject$ = new BehaviorSubject<Subscription[]>(
    [],
  );
  private readonly loadingSubject$ = new BehaviorSubject<boolean>(false);
  private readonly errorSubject$ = new BehaviorSubject<string | null>(null);

  readonly subscriptions$ = this.subscriptionsSubject$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly isLoading$ = this.loadingSubject$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly error$ = this.errorSubject$
    .asObservable()
    .pipe(distinctUntilChanged());

  // Tracks the in-flight loadSubscriptions() request so it can be cancelled
  // before a stale response from a previous session overwrites the new data.
  private loadSubscription: RxSubscription | null = null;

  loadSubscriptions(): void {
    this.loadSubscription?.unsubscribe();
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.loadSubscription = this.subscriptionApi
      .getSubscriptions()
      .pipe(
        catchError((err) => {
          this.setTranslatedError(
            err?.error?.message,
            'SUBSCRIPTIONS.LOAD_ERROR',
          );
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe((subscriptions) => {
        this.subscriptionsSubject$.next(subscriptions);
        this.loadingSubject$.next(false);
      });
  }

  clear(): void {
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = null;
    this.subscriptionsSubject$.next([]);
    this.errorSubject$.next(null);
  }

  cancelSubscription(id: string, cancelAtPeriodEnd = true): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.subscriptionApi
      .cancelSubscription(id, cancelAtPeriodEnd)
      .pipe(
        catchError((err) => {
          this.setTranslatedError(
            err?.error?.message,
            'SUBSCRIPTIONS.CANCEL_ERROR',
          );
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.loadSubscriptions();
      });
  }
}
