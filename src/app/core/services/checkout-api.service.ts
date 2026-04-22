import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaymentIntentResponse, Order, Address } from '../interfaces';

export interface CreatePaymentIntentRequest {
  cartId: string;
  userId?: string;
  email: string;
  billingAddress: Address;
  shippingAddress?: Address;
}

export interface ConfirmOrderRequest {
  paymentIntentId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutApiService {
  private readonly api = inject(ApiService);

  createPaymentIntent(
    data: CreatePaymentIntentRequest,
  ): Observable<PaymentIntentResponse> {
    return this.api.post<CreatePaymentIntentRequest, PaymentIntentResponse>(
      'checkout/payment-intent',
      data,
    );
  }

  confirmOrder(data: ConfirmOrderRequest): Observable<Order> {
    return this.api.post<ConfirmOrderRequest, Order>('checkout/confirm', data);
  }
}
