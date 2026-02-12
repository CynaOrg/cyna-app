import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  EMPTY,
  catchError,
} from 'rxjs';
import { Order } from '../interfaces';
import { OrderApiService } from '../services/order-api.service';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private readonly orderApi = inject(OrderApiService);

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

  loadOrders(): void {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    this.orderApi
      .getOrders()
      .pipe(
        catchError((err) => {
          this.errorSubject$.next(
            err?.error?.message || 'Failed to load orders',
          );
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
}
