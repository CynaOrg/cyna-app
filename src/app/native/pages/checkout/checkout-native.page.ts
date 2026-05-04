import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorCheck,
  phosphorCreditCard,
  phosphorMapPin,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import { Address } from '@core/interfaces';
import { AuthStore } from '@core/stores/auth.store';
import { CartStore } from '@core/stores/cart.store';
import { CheckoutStore } from '@core/stores/checkout.store';
import { NativePageHeaderComponent } from '../../components/native-page-header.component';
import { HapticOnDirective } from '../../directives/haptic-on.directive';
import {
  NativeStripePaymentElementComponent,
} from '../../components/native-stripe-payment-element.component';

type CheckoutStep = 'auth' | 'billing' | 'shipping' | 'payment' | 'confirm';

/**
 * Native checkout page mounted at `/m/checkout`.
 *
 * Implements the 5-step tunnel from the cadrage spec (Phase 3 Checkout):
 * 1. Authentication (login or guest),
 * 2. Billing address,
 * 3. Shipping address (only when the cart has physical items),
 * 4. Payment via the native Stripe Payment Element with Apple Pay,
 * 5. Confirmation.
 *
 * The page is rendered as a single scrollable surface (no stepper widget) so
 * the user can review previous steps without losing state. Each step is
 * collapsed once completed and the active step exposes its inputs.
 */
@Component({
  selector: 'app-checkout-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    NgIconComponent,
    NativePageHeaderComponent,
    NativeStripePaymentElementComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowLeft,
      phosphorCheck,
      phosphorCreditCard,
      phosphorMapPin,
      phosphorUser,
    }),
  ],
  providers: [CheckoutStore],
  templateUrl: './checkout-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutNativePage implements OnInit {
  private readonly cartStore = inject(CartStore);
  readonly checkoutStore = inject(CheckoutStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly items = toSignal(this.cartStore.items$, { initialValue: [] });
  readonly total = toSignal(this.cartStore.total$, { initialValue: 0 });
  readonly cart = toSignal(this.cartStore.cart$, { initialValue: null });
  readonly isEmpty = toSignal(this.cartStore.isEmpty$, { initialValue: true });

  readonly clientSecret = toSignal(this.checkoutStore.clientSecret$, {
    initialValue: null,
  });
  readonly isLoading = toSignal(this.checkoutStore.isLoading$, {
    initialValue: false,
  });
  readonly storeError = toSignal(this.checkoutStore.error$, {
    initialValue: null,
  });
  readonly user = toSignal(this.authStore.user$, { initialValue: null });
  readonly isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  readonly currentStep = signal<CheckoutStep>('auth');
  readonly isSubmitting = signal(false);
  readonly paymentError = signal('');
  readonly authMode = signal<'guest' | 'login'>('guest');

  readonly hasPhysicalItems = computed(() =>
    this.items().some((i) => i.product?.productType === 'physical'),
  );

  readonly totalCents = computed(() =>
    Math.round(this.total() * 1.2 * 100),
  );

  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  billingForm: FormGroup = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['FR', Validators.required],
    state: [''],
  });

  shippingForm: FormGroup = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['FR', Validators.required],
    state: [''],
  });

  @ViewChild('stripeElement')
  stripeElement?: NativeStripePaymentElementComponent;

  ngOnInit(): void {
    if (this.isEmpty()) {
      this.router.navigateByUrl('/m/cart');
      return;
    }

    const u = this.user();
    if (u?.email) {
      this.emailForm.patchValue({ email: u.email });
      this.checkoutStore.setEmail(u.email);
      this.currentStep.set('billing');
    }
  }

  // Step navigation -------------------------------------------------------

  setStep(step: CheckoutStep): void {
    this.currentStep.set(step);
  }

  continueAsGuest(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const email = this.emailForm.value.email as string;
    this.checkoutStore.setEmail(email);
    this.currentStep.set('billing');
  }

  goToLogin(): void {
    this.router.navigate(['/m/auth/login'], {
      queryParams: { returnUrl: '/m/checkout' },
    });
  }

  submitBilling(): void {
    if (this.billingForm.invalid) {
      this.billingForm.markAllAsTouched();
      return;
    }
    const address = this.billingForm.value as Address;
    this.checkoutStore.setBillingAddress(address);
    this.currentStep.set(this.hasPhysicalItems() ? 'shipping' : 'payment');
    this.maybeCreatePaymentIntent();
  }

  submitShipping(): void {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }
    const address = this.shippingForm.value as Address;
    this.checkoutStore.setShippingAddress(address);
    this.currentStep.set('payment');
    this.maybeCreatePaymentIntent();
  }

  private maybeCreatePaymentIntent(): void {
    if (this.clientSecret()) return;
    const cart = this.cart();
    if (!cart?.id) return;
    this.checkoutStore.createPaymentIntent(cart.id);
  }

  onPaymentError(err: string): void {
    this.paymentError.set(err);
  }

  async onSubmit(): Promise<void> {
    if (!this.stripeElement || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.paymentError.set('');

    const result = await this.stripeElement.submit();
    if (result.success) {
      this.cartStore.clear();
      const { orderId, orderNumber, paymentIntentId } = this.checkoutStore.state;
      this.router.navigate(['/m/order/confirmation', orderId], {
        state: {
          orderNumber,
          paymentIntentId,
          total: this.total(),
          items: this.items(),
        },
      });
    } else if (result.error) {
      this.paymentError.set(result.error);
    }

    this.isSubmitting.set(false);
  }
}
