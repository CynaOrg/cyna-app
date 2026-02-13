import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, EMPTY, catchError } from 'rxjs';
import { Subscription } from '../interfaces';
import { SubscriptionApiService } from '../services/subscription-api.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionStore {
  private readonly subscriptionApi = inject(SubscriptionApiService);

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

  loadSubscriptions(): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.subscriptionApi
      .getSubscriptions()
      .pipe(
        catchError((err) => {
          this.errorSubject$.next(
            err?.error?.message || 'Failed to load subscriptions',
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
          this.errorSubject$.next(
            err?.error?.message || 'Failed to cancel subscription',
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
