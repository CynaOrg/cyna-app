import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { ProductStore } from '@core/stores/product.store';
import { SubscriptionApiService } from '@core/services/subscription-api.service';
import { ProductDetail, Address } from '@core/interfaces';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobileHeaderService } from '@core/services/mobile-header.service';
import { StripePaymentElementComponent } from '@shared/components/stripe-payment-element/stripe-payment-element.component';
import { AddressPickerComponent } from '@shared/components/address-picker/address-picker.component';
import { AuthStore } from '@core/stores/auth.store';
import { UserAddressStore } from '@core/stores/user-address.store';

@Component({
  host: { class: 'ion-page' },
  standalone: false,
  selector: 'app-subscribe',
  templateUrl: './subscribe.page.html',
})
export class SubscribePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productStore = inject(ProductStore);
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly authStore = inject(AuthStore);
  private readonly addressStore = inject(UserAddressStore);

  private readonly isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  private readonly header = inject(MobileHeaderService);
  isNative = isNativeCapacitor();

  ionViewWillEnter(): void {
    if (this.isNative && !this.isDashboard) {
      this.header.configure({
        showBack: true,
        title: 'SUBSCRIBE.TITLE',
        showSearch: true,
        showCart: true,
        visible: true,
      });
    } else {
      this.header.hide();
    }
    if (this.isNative) this.header.navbarHidden.set(true);
  }

  ionViewWillLeave(): void {
    this.header.navbarHidden.set(false);
  }
  /** Recomputed on every read so a cached page entered first via /dashboard
      and later via the storefront route doesn't stay locked in dashboard mode. */
  get isDashboard(): boolean {
    return this.router.url.startsWith('/dashboard');
  }
  scrolled = false;

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
  }

  product = signal<ProductDetail | null>(null);
  isLoadingProduct = signal(true);
  billingPeriod = signal<'monthly' | 'yearly'>('monthly');
  clientSecret = signal<string | null>(null);
  subscriptionId = signal<string | null>(null);
  billingAddress: Address | null = null;
  readonly billingValid = signal(false);
  isCreating = signal(false);
  isSubmitting = false;
  paymentReady = false;
  error = signal<string | null>(null);

  @ViewChild('stripeElement')
  stripeElement?: StripePaymentElementComponent;

  @ViewChild('billingPicker') billingPicker?: AddressPickerComponent;

  saveBillingToBook = true;

  onSaveBillingToBook(v: boolean): void {
    this.saveBillingToBook = v;
  }

  /** 1 = Subscription/Plan + Billing form, 2 = Payment. Decoupled from
      `clientSecret` so back/forward never destroys the existing intent. */
  readonly currentStep = signal<1 | 2>(1);

  constructor() {
    effect(() => {
      if (this.clientSecret() && this.currentStep() === 1) {
        this.currentStep.set(2);
      }
    });
  }

  goToStep(step: 1 | 2): void {
    if (step === 2 && !this.clientSecret()) return;
    this.currentStep.set(step);
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('productSlug');
    if (!slug) {
      this.router.navigate(['/']);
      return;
    }

    this.productStore
      .fetchProductBySlug(slug)
      .pipe(
        catchError(() => {
          this.isLoadingProduct.set(false);
          return EMPTY;
        }),
      )
      .subscribe((product) => {
        if (!product || product.productType !== 'saas') {
          this.router.navigate(['/products', slug]);
          return;
        }
        this.product.set(product);
        this.isLoadingProduct.set(false);
      });
  }

  get currentPrice(): number {
    const p = this.product();
    if (!p) return 0;
    return this.billingPeriod() === 'yearly'
      ? (p.priceYearly ?? 0)
      : (p.priceMonthly ?? 0);
  }

  get savingsPercent(): number {
    const p = this.product();
    if (!p?.priceMonthly || !p?.priceYearly) return 0;
    const yearlyMonthly = p.priceYearly / 12;
    return Math.round((1 - yearlyMonthly / p.priceMonthly) * 100);
  }

  toggleBillingPeriod(period: 'monthly' | 'yearly'): void {
    this.billingPeriod.set(period);
  }

  onBillingAddressChange(address: Address): void {
    this.billingAddress = address;
  }

  onBillingValidityChange(valid: boolean): void {
    this.billingValid.set(valid);
  }

  createSubscription(): void {
    // Already created on a previous click — just re-show step 2.
    if (this.clientSecret()) {
      this.goToStep(2);
      return;
    }

    const p = this.product();
    if (!p) return;

    const billingValid = this.billingPicker?.isValid() ?? false;
    if (!billingValid) {
      this.error.set(
        "Veuillez remplir tous les champs obligatoires de l'adresse de facturation",
      );
      return;
    }

    if (!this.billingAddress) return;

    this.isCreating.set(true);
    this.error.set(null);

    this.persistAddressToBook();

    this.subscriptionApi
      .createSubscription({
        productId: p.id,
        billingPeriod: this.billingPeriod(),
        billingAddress: this.billingAddress,
      })
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.error?.error?.message ||
              err?.error?.message ||
              'Failed to create subscription',
          );
          this.isCreating.set(false);
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.clientSecret.set(response.clientSecret);
        this.subscriptionId.set(response.subscriptionId);
        this.isCreating.set(false);
      });
  }

  /** Save the new billing address to the user's address book if the user
      asked to keep it. Skips silently for guests, for existing book entries,
      or for strict duplicates. */
  private persistAddressToBook(): void {
    if (!this.isAuthenticated()) return;
    if (!this.billingPicker?.shouldSaveToBook()) return;
    const payload = this.billingPicker.buildUpsertPayload('Facturation');
    if (!payload) return;
    this.addressStore
      .createIfNotDuplicate(payload)
      .subscribe({ error: () => {} });
  }

  onPaymentReady(): void {
    this.paymentReady = true;
  }

  paymentError = '';

  onPaymentError(errorMsg: string): void {
    this.paymentReady = false;
    this.paymentError = errorMsg;
  }

  async onSubmit(): Promise<void> {
    if (!this.stripeElement || this.isSubmitting) return;

    this.isSubmitting = true;
    this.paymentError = '';

    const result = await this.stripeElement.submit();
    if (result.success) {
      const subId = this.subscriptionId();
      const p = this.product();
      if (subId && p) {
        this.router.navigate(['/subscription/confirmation', subId], {
          state: {
            productId: p.id,
            productName: p.name,
            productImageUrl:
              p.primaryImageUrl ?? p.images?.[0]?.imageUrl ?? null,
            billingPeriod: this.billingPeriod(),
            price: this.currentPrice,
            status: 'active',
          },
        });
      } else {
        this.router.navigate(['/dashboard/subscriptions']);
      }
    } else if (result.error) {
      this.paymentError = result.error;
    }

    this.isSubmitting = false;
  }
}
