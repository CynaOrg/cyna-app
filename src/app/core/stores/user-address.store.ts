import { Injectable, inject } from '@angular/core';
import {
  Observable,
  of,
  tap,
  catchError,
  EMPTY,
  map,
  distinctUntilChanged,
  firstValueFrom,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BaseStore } from './base.store';
import { UserAddressApiService } from '../services/user-address-api.service';
import {
  UserAddress,
  UpsertUserAddressPayload,
} from '../interfaces/user-address.interface';

@Injectable({ providedIn: 'root' })
export class UserAddressStore extends BaseStore<UserAddress[]> {
  private readonly api = inject(UserAddressApiService);
  private readonly translate = inject(TranslateService);

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
          const serverMsg = err?.message;
          if (serverMsg) {
            this.setError(serverMsg);
          } else {
            firstValueFrom(this.translate.get('ADDRESSES.LOAD_ERROR')).then(
              (msg) => this.setError(msg),
            );
          }
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

  /** Returns the first stored address that matches `payload` on every
      address-defining field (street/city/postalCode/country/recipient/phone),
      or null if none. Used for silent dedup at checkout. */
  findDuplicate(payload: UpsertUserAddressPayload): UserAddress | null {
    const list = this.state.data ?? [];
    const norm = (v?: string | null) => (v ?? '').trim().toLowerCase();
    return (
      list.find(
        (a) =>
          norm(a.street) === norm(payload.street) &&
          norm(a.city) === norm(payload.city) &&
          norm(a.postalCode) === norm(payload.postalCode) &&
          norm(a.country) === norm(payload.country) &&
          norm(a.state) === norm(payload.state) &&
          norm(a.recipientName) === norm(payload.recipientName) &&
          norm(a.phone) === norm(payload.phone),
      ) ?? null
    );
  }

  /** Creates the address only if no exact duplicate already exists in the
      book. Resolves with the existing match on dedup, or with the newly
      created address otherwise. Used at checkout to honour
      "Enregistrer dans mon carnet" without producing duplicates. */
  createIfNotDuplicate(
    payload: UpsertUserAddressPayload,
  ): Observable<UserAddress> {
    const dup = this.findDuplicate(payload);
    if (dup) return of(dup);
    return this.create(payload);
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
