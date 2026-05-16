import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  EMPTY,
  Subscription,
  catchError,
  firstValueFrom,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Order } from '../interfaces';
import { OrderApiService } from '../services/order-api.service';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private readonly orderApi = inject(OrderApiService);
  private readonly translate = inject(TranslateService);

  private readonly ordersSubject$ = new BehaviorSubject<Order[]>([]);
  private readonly loadingSubject$ = new BehaviorSubject<boolean>(false);
  private readonly errorSubject$ = new BehaviorSubject<string | null>(null);

  readonly orders$ = this.ordersSubject$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly isLoading$ = this.loadingSubject$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly error$ = this.errorSubject$
    .asObservable()
    .pipe(distinctUntilChanged());

  // Tracks the in-flight loadOrders() subscription so we can cancel a stale
  // request from a previous user session before it overwrites the new data
  // (or sets the error stream from a now-irrelevant 401).
  private loadSubscription: Subscription | null = null;

  loadOrders(): void {
    this.loadSubscription?.unsubscribe();
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.loadSubscription = this.orderApi
      .getOrders()
      .pipe(
        catchError((err) => {
          const serverMsg = err?.error?.message;
          if (serverMsg) {
            this.errorSubject$.next(serverMsg);
          } else {
            firstValueFrom(this.translate.get('ORDERS.LOAD_ERROR')).then(
              (msg) => this.errorSubject$.next(msg),
            );
          }
          this.loadingSubject$.next(false);
          return EMPTY;
        }),
      )
      .subscribe((orders) => {
        this.ordersSubject$.next(orders);
        this.loadingSubject$.next(false);
      });
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSubject$.getValue().find((o) => o.id === id);
  }

  clear(): void {
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = null;
    this.ordersSubject$.next([]);
    this.errorSubject$.next(null);
  }
}
