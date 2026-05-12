import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CartStore } from '@core/stores/cart.store';
import { CheckoutStore } from '@core/stores/checkout.store';
import { AuthStore } from '@core/stores/auth.store';
import { Address } from '@core/interfaces';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobileHeaderService } from '@core/services/mobile-header.service';
import { StripePaymentElementComponent } from '@shared/components/stripe-payment-element/stripe-payment-element.component';
import { AddressPickerComponent } from '@shared/components/address-picker/address-picker.component';
import { UserAddressStore } from '@core/stores/user-address.store';

@Component({
  host: { class: 'ion-page' },
  standalone: false,
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  providers: [CheckoutStore],
})
export class CheckoutPage implements OnInit {
  private readonly cartStore = inject(CartStore);
  readonly checkoutStore = inject(CheckoutStore);
  private readonly authStore = inject(AuthStore);
  private readonly addressStore = inject(UserAddressStore);
  private readonly router = inject(Router);

  private readonly header = inject(MobileHeaderService);
  isNative = isNativeCapacitor();

  ionViewWillEnter(): void {
    if (this.isNative && !this.isDashboard) {
      this.header.configure({
        showBack: true,
        title: 'CHECKOUT.TITLE',
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
  /** Recomputed on every read so the cached page reflects the active URL. */
  get isDashboard(): boolean {
    return this.router.url.startsWith('/dashboard');
  }
  scrolled = false;

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
  }

  items = toSignal(this.cartStore.items$, { initialValue: [] });
  total = toSignal(this.cartStore.total$, { initialValue: 0 });
  isEmpty = toSignal(this.cartStore.isEmpty$, { initialValue: true });
  cart = toSignal(this.cartStore.cart$, { initialValue: null });

  clientSecret = toSignal(this.checkoutStore.clientSecret$, {
    initialValue: null,
  });
  isLoading = toSignal(this.checkoutStore.isLoading$, { initialValue: false });
  error = toSignal(this.checkoutStore.error$, { initialValue: null });

  user = toSignal(this.authStore.user$, { initialValue: null });
  isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  email = '';
  isSubmitting = false;
  paymentReady = false;
  /** Step the user is currently on: 1 = Information, 2 = Payment.
      Decoupled from `clientSecret` so back/forward never destroys the
      already-created payment intent on the API side. */
  readonly currentStep = signal<1 | 2>(1);
  /** When true, shipping address mirrors billing — picker is hidden. */
  readonly useBillingAsShipping = signal(true);
  /** Reactive mirror of `email` so `canContinue` re-evaluates on input. */
  readonly emailSig = signal('');
  /** Reactive validity signals fed by AddressPicker (validityChange). */
  readonly billingValid = signal(false);
  readonly shippingValid = signal(false);

  /** Disables the "continue to payment" CTA until everything required is OK. */
  readonly canContinue = computed(() => {
    if (!this.emailSig()) return false;
    if (!this.billingValid()) return false;
    if (
      this.hasPhysicalItems() &&
      !this.useBillingAsShipping() &&
      !this.shippingValid()
    ) {
      return false;
    }
    return true;
  });

  toggleUseBillingAsShipping(value: boolean): void {
    this.useBillingAsShipping.set(value);
    if (value) {
      const billing = this.checkoutStore.state.billingAddress;
      if (billing) this.checkoutStore.setShippingAddress(billing);
    }
  }

  @ViewChild('stripeElement')
  stripeElement?: StripePaymentElementComponent;

  @ViewChild('billingPicker') billingPicker?: AddressPickerComponent;
  @ViewChild('shippingPicker') shippingPicker?: AddressPickerComponent;

  constructor() {
    // Auto-advance to step 2 the first time we get a clientSecret. Doesn't
    // pin the step there: user can still go back to step 1 manually.
    effect(() => {
      if (this.clientSecret() && this.currentStep() === 1) {
        this.currentStep.set(2);
      }
    });
  }

  /** Stepper / back-button navigation. Step 2 only reachable once the
      payment intent has been created (clientSecret is set). */
  goToStep(step: 1 | 2): void {
    if (step === 2 && !this.clientSecret()) return;
    this.currentStep.set(step);
  }

  ngOnInit(): void {
    // Redirect to cart if empty
    if (this.isEmpty()) {
      this.router.navigate([this.isDashboard ? '/dashboard/cart' : '/cart']);
      return;
    }

    // Pre-fill email if user is authenticated
    const currentUser = this.user();
    if (currentUser?.email) {
      this.email = currentUser.email;
      this.emailSig.set(currentUser.email);
      this.checkoutStore.setEmail(currentUser.email);
    }
  }

  onBillingValidityChange(valid: boolean): void {
    this.billingValid.set(valid);
  }

  onShippingValidityChange(valid: boolean): void {
    this.shippingValid.set(valid);
  }

  hasPhysicalItems(): boolean {
    return this.items().some(
      (item) => item.product?.productType === 'physical',
    );
  }

  onEmailChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.email = value;
    this.emailSig.set(value);
    this.checkoutStore.setEmail(value);
  }

  onBillingAddressChange(address: Address): void {
    this.checkoutStore.setBillingAddress(address);
    if (this.useBillingAsShipping() && this.hasPhysicalItems()) {
      this.checkoutStore.setShippingAddress(address);
    }
  }

  onShippingAddressChange(address: Address): void {
    this.checkoutStore.setShippingAddress(address);
  }

  onPaymentReady(): void {
    this.paymentReady = true;
  }

  paymentError = '';
  saveBillingToBook = false;
  saveShippingToBook = false;

  onSaveBillingToBook(v: boolean): void {
    this.saveBillingToBook = v;
  }

  onSaveShippingToBook(v: boolean): void {
    this.saveShippingToBook = v;
  }

  onPaymentError(error: string): void {
    this.paymentReady = false;
    this.paymentError = error;
  }

  createPaymentIntent(): void {
    // If we already have a client secret, this is a "re-enter step 2"
    // navigation — skip the API call (which would reject with `Cart is
    // empty` since the backend converts the cart into an order on the first
    // call) and just switch the visible step.
    if (this.clientSecret()) {
      this.goToStep(2);
      return;
    }

    if (!this.email) return;

    const billingValid = this.billingPicker?.isValid() ?? false;
    if (!billingValid) return;

    if (this.hasPhysicalItems() && !this.useBillingAsShipping()) {
      const shippingValid = this.shippingPicker?.isValid() ?? false;
      if (!shippingValid) return;
    }

    const cartData = this.cart();
    if (!cartData?.id) return;

    // Persist the address book entries the customer asked to keep BEFORE we
    // create the payment intent — so even if the payment ultimately fails,
    // the addresses they took the time to type are saved. Silent dedup
    // skips the call when an identical entry already exists.
    this.persistAddressesToBook();

    this.checkoutStore.createPaymentIntent(cartData.id);
  }

  /** Save any new address marked "Enregistrer dans mon carnet" to the
      user's address book. Skips silently if the user is a guest, if the
      picker holds an existing book entry, or if the address is a strict
      duplicate of an already-stored one. */
  private persistAddressesToBook(): void {
    if (!this.isAuthenticated()) return;
    if (this.billingPicker?.shouldSaveToBook()) {
      const payload = this.billingPicker.buildUpsertPayload('Facturation');
      if (payload) {
        this.addressStore
          .createIfNotDuplicate(payload)
          .subscribe({ error: () => {} });
      }
    }
    if (
      this.hasPhysicalItems() &&
      !this.useBillingAsShipping() &&
      this.shippingPicker?.shouldSaveToBook()
    ) {
      const payload = this.shippingPicker.buildUpsertPayload('Livraison');
      if (payload) {
        this.addressStore
          .createIfNotDuplicate(payload)
          .subscribe({ error: () => {} });
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.stripeElement || this.isSubmitting) return;

    this.isSubmitting = true;
    this.paymentError = '';

    const result = await this.stripeElement.submit();
    if (result.success) {
      this.cartStore.clear();
      const { orderId, orderNumber, paymentIntentId } =
        this.checkoutStore.state;
      const confirmPath = this.isDashboard
        ? '/dashboard/order/confirmation'
        : '/order/confirmation';
      this.router.navigate([confirmPath, orderId], {
        state: {
          orderNumber,
          paymentIntentId,
          total: this.total(),
          items: this.items(),
        },
      });
    } else if (result.error) {
      this.paymentError = result.error;
    }

    this.isSubmitting = false;
  }
}
