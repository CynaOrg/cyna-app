import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromise: Promise<Stripe | null> | null = null;

  getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = loadStripe(environment.stripePublishableKey);
    }
    return this.stripePromise;
  }
}
