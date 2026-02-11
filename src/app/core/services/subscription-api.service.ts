import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Subscription,
  CreateSubscriptionResponse,
  Address,
} from '../interfaces';

export interface CreateSubscriptionRequest {
  productId: string;
  billingPeriod: string;
  billingAddress: Address;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionApiService {
  private readonly api = inject(ApiService);

  createSubscription(
    data: CreateSubscriptionRequest,
  ): Observable<CreateSubscriptionResponse> {
    return this.api.post<CreateSubscriptionRequest, CreateSubscriptionResponse>(
      'subscriptions',
      data,
    );
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.api.getList<Subscription>('subscriptions');
  }

  cancelSubscription(
    id: string,
    cancelAtPeriodEnd = true,
  ): Observable<Subscription> {
    return this.api.post<{ cancelAtPeriodEnd: boolean }, Subscription>(
      `subscriptions/${id}/cancel`,
      { cancelAtPeriodEnd },
    );
  }
}
