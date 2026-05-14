import { Injectable, inject } from '@angular/core';
import { loadStripe, Stripe, StripeElementLocale } from '@stripe/stripe-js';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private readonly translate = inject(TranslateService);
  private stripePromise: Promise<Stripe | null> | null = null;

  getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      // Stripe caches the SDK after the first load, so the locale captured
      // here applies for the whole session. CYNA is FR-first; we fall back
      // to the active TranslateService language if it has been switched.
      this.stripePromise = loadStripe(environment.stripePublishableKey, {
        locale: this.getStripeLocale(),
      });
    }
    return this.stripePromise;
  }

  getStripeLocale(): StripeElementLocale {
    const active = (
      this.translate.currentLang ||
      this.translate.defaultLang ||
      'fr'
    ).toLowerCase();
    return active === 'en' ? 'en' : 'fr';
  }
}
