import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  UserAddress,
  UpsertUserAddressPayload,
} from '../interfaces/user-address.interface';

@Injectable({ providedIn: 'root' })
export class UserAddressApiService {
  private readonly api = inject(ApiService);

  list(): Observable<UserAddress[]> {
    return this.api.get<UserAddress[]>('users/me/addresses');
  }

  create(payload: UpsertUserAddressPayload): Observable<UserAddress> {
    return this.api.post<UpsertUserAddressPayload, UserAddress>(
      'users/me/addresses',
      payload,
    );
  }

  update(
    id: string,
    payload: Partial<UpsertUserAddressPayload>,
  ): Observable<UserAddress> {
    return this.api.patch<Partial<UpsertUserAddressPayload>, UserAddress>(
      `users/me/addresses/${id}`,
      payload,
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`users/me/addresses/${id}`);
  }
}
