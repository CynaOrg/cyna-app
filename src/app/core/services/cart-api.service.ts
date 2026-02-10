import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  CartResponse,
  AddCartItemRequest,
  UpdateCartItemRequest,
} from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root',
})
export class CartApiService {
  private readonly api = inject(ApiService);

  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>('cart');
  }

  addItem(dto: AddCartItemRequest): Observable<CartResponse> {
    return this.api.post<AddCartItemRequest, CartResponse>('cart/items', dto);
  }

  updateItem(
    productId: string,
    quantity: number,
    billingPeriod?: string,
  ): Observable<CartResponse> {
    const params = billingPeriod ? `?billingPeriod=${billingPeriod}` : '';
    return this.api.patch<UpdateCartItemRequest, CartResponse>(
      `cart/items/${productId}${params}`,
      { quantity },
    );
  }

  removeItem(
    productId: string,
    billingPeriod?: string,
  ): Observable<CartResponse> {
    const params = billingPeriod ? `?billingPeriod=${billingPeriod}` : '';
    return this.api.delete<CartResponse>(`cart/items/${productId}${params}`);
  }

  clearCart(): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>('cart');
  }

  mergeGuestCart(): Observable<CartResponse> {
    return this.api.post<Record<string, never>, CartResponse>('cart/merge', {});
  }
}
