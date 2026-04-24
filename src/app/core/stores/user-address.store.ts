import { Injectable, inject } from '@angular/core';
import {
  Observable,
  tap,
  catchError,
  EMPTY,
  map,
  distinctUntilChanged,
} from 'rxjs';
import { BaseStore } from './base.store';
import { UserAddressApiService } from '../services/user-address-api.service';
import {
  UserAddress,
  UpsertUserAddressPayload,
} from '../interfaces/user-address.interface';

@Injectable({ providedIn: 'root' })
export class UserAddressStore extends BaseStore<UserAddress[]> {
  private readonly api = inject(UserAddressApiService);

  readonly defaultShipping$ = this.data$.pipe(
    map((d) => d?.find((a) => a.isDefaultShipping) ?? null),
    distinctUntilChanged(),
  );
  readonly defaultBilling$ = this.data$.pipe(
    map((d) => d?.find((a) => a.isDefaultBilling) ?? null),
    distinctUntilChanged(),
  );

  load(): void {
    this.setLoading(true);
    this.api
      .list()
      .pipe(
        tap((data) => this.setData(data)),
        catchError((err) => {
          this.setError(err?.message ?? 'Failed to load addresses');
          return EMPTY;
        }),
      )
      .subscribe();
  }

  create(payload: UpsertUserAddressPayload): Observable<UserAddress> {
    return this.api.create(payload).pipe(
      tap((created) => {
        const current = this.state.data ?? [];
        const next = this.reapplyDefaults([...current, created]);
        this.setData(next);
      }),
    );
  }

  update(
    id: string,
    payload: Partial<UpsertUserAddressPayload>,
  ): Observable<UserAddress> {
    return this.api.update(id, payload).pipe(
      tap((updated) => {
        const current = this.state.data ?? [];
        const next = this.reapplyDefaults(
          current.map((a) => (a.id === id ? updated : a)),
        );
        this.setData(next);
      }),
    );
  }

  remove(id: string): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        const current = this.state.data ?? [];
        this.setData(current.filter((a) => a.id !== id));
      }),
    );
  }

  /**
   * Ensures only the latest-touched default per type remains; mirrors the
   * backend invariant client-side so the UI never shows two defaults briefly.
   */
  private reapplyDefaults(list: UserAddress[]): UserAddress[] {
    const shippingDefaults = list.filter((a) => a.isDefaultShipping);
    const billingDefaults = list.filter((a) => a.isDefaultBilling);
    return list.map((a) => {
      let isDefaultShipping = a.isDefaultShipping;
      let isDefaultBilling = a.isDefaultBilling;
      if (
        shippingDefaults.length > 1 &&
        a.id !== shippingDefaults[shippingDefaults.length - 1].id
      ) {
        isDefaultShipping = false;
      }
      if (
        billingDefaults.length > 1 &&
        a.id !== billingDefaults[billingDefaults.length - 1].id
      ) {
        isDefaultBilling = false;
      }
      return { ...a, isDefaultShipping, isDefaultBilling };
    });
  }
}
