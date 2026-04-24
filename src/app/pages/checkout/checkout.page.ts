import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CartStore } from '@core/stores/cart.store';
import { CheckoutStore } from '@core/stores/checkout.store';
import { AuthStore } from '@core/stores/auth.store';
import { Address } from '@core/interfaces';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { StripePaymentElementComponent } from '@shared/components/stripe-payment-element/stripe-payment-element.component';
import { AddressPickerComponent } from '@shared/components/address-picker/address-picker.component';
import { UserAddressStore } from '@core/stores/user-address.store';

@Component({
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

  isNative = isNativeCapacitor();
  isDashboard = window.location.pathname.startsWith('/dashboard');

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

  @ViewChild('stripeElement')
  stripeElement?: StripePaymentElementComponent;

  @ViewChild('billingPicker') billingPicker?: AddressPickerComponent;
  @ViewChild('shippingPicker') shippingPicker?: AddressPickerComponent;

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
      this.checkoutStore.setEmail(currentUser.email);
    }
  }

  hasPhysicalItems(): boolean {
    return this.items().some(
      (item) => item.product?.productType === 'physical',
    );
  }

  onEmailChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.email = value;
    this.checkoutStore.setEmail(value);
  }

  onBillingAddressChange(address: Address): void {
    this.checkoutStore.setBillingAddress(address);
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
    if (!this.email) return;

    const billingValid = this.billingPicker?.isValid() ?? false;
    if (!billingValid) return;

    if (this.hasPhysicalItems()) {
      const shippingValid = this.shippingPicker?.isValid() ?? false;
      if (!shippingValid) return;
    }

    const cartData = this.cart();
    if (!cartData?.id) return;

    this.checkoutStore.createPaymentIntent(cartData.id);
  }

  async onSubmit(): Promise<void> {
    if (!this.stripeElement || this.isSubmitting) return;

    this.isSubmitting = true;
    this.paymentError = '';

    const result = await this.stripeElement.submit();
    if (result.success) {
      // Fire-and-forget save to address book for newly-entered addresses.
      if (this.isAuthenticated()) {
        if (this.billingPicker?.shouldSaveToBook()) {
          const payload = this.billingPicker.buildUpsertPayload();
          if (payload)
            this.addressStore.create(payload).subscribe({ error: () => {} });
        }
        if (
          this.hasPhysicalItems() &&
          this.shippingPicker?.shouldSaveToBook()
        ) {
          const payload = this.shippingPicker.buildUpsertPayload();
          if (payload)
            this.addressStore.create(payload).subscribe({ error: () => {} });
        }
      }
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
