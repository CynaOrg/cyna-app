import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Capacitor } from '@capacitor/core';
import {
  PaymentRequest,
  Stripe,
  StripeElements,
  StripePaymentElement,
  StripePaymentRequestButtonElement,
} from '@stripe/stripe-js';
import { StripeService } from '@core/services/stripe.service';

/**
 * Native Stripe Payment Element wrapper that prefers Apple Pay on iOS.
 *
 * Mounts the unified Stripe Payment Element together with a Payment Request
 * Button (Apple Pay / Google Pay) above it when the device supports it. The
 * `paymentMethodOrder` is reordered to place Apple Pay first on iOS native
 * builds so it is the default choice in the in-page wallet picker.
 *
 * Usage:
 * ```html
 * <app-native-stripe-payment-element
 *   #stripeElement
 *   [clientSecret]="clientSecret()!"
 *   [amount]="totalCents()"
 *   currency="eur"
 *   country="FR"
 *   (paymentSuccess)="onSuccess()"
 *   (paymentError)="onError($event)"
 * />
 * ```
 *
 * Call `submit()` on the component reference to confirm the payment from the
 * host page. The element only emits `paymentSuccess` after the wallet flow
 * (Apple Pay sheet) completes; for the inline confirm flow the host receives
 * the `{success, error}` returned by `submit()`.
 */
@Component({
  selector: 'app-native-stripe-payment-element',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Apple Pay / Payment Request Button (above card form) -->
      @if (showWalletButton()) {
        <div #walletButton class="w-full"></div>
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-border/40"></div>
          <span class="text-xs uppercase tracking-wide text-text-muted">
            {{ 'CHECKOUT.OR_PAY_BY_CARD' | translate }}
          </span>
          <div class="h-px flex-1 bg-border/40"></div>
        </div>
      }

      <!-- Unified Payment Element (card + saved methods) -->
      <div
        #paymentElement
        class="w-full rounded-2xl border border-input-border bg-input-bg px-4 py-4 transition-colors"
        [class.border-primary]="elementFocused()"
      ></div>

      @if (errorMessage()) {
        <p class="text-sm text-error">{{ errorMessage() }}</p>
      }
    </div>
  `,
})
export class NativeStripePaymentElementComponent implements OnInit, OnDestroy {
  readonly clientSecret = input.required<string>();
  readonly amount = input<number>(0); // amount in smallest currency unit (cents)
  readonly currency = input<string>('eur');
  readonly country = input<string>('FR');

  readonly paymentSuccess = output<void>();
  readonly paymentError = output<string>();

  @ViewChild('paymentElement', { static: true })
  paymentElementRef!: ElementRef<HTMLDivElement>;

  @ViewChild('walletButton')
  walletButtonRef?: ElementRef<HTMLDivElement>;

  private readonly stripeService = inject(StripeService);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;
  private paymentRequest: PaymentRequest | null = null;
  private prButton: StripePaymentRequestButtonElement | null = null;

  readonly elementFocused = signal(false);
  readonly errorMessage = signal('');
  readonly showWalletButton = signal(false);
  readonly isReady = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.stripe = await this.stripeService.getStripe();
      if (!this.stripe) {
        this.fail('Failed to load Stripe');
        return;
      }

      const isIos = Capacitor.getPlatform() === 'ios';
      const order = isIos
        ? ['apple_pay', 'google_pay', 'card']
        : ['card', 'apple_pay', 'google_pay'];

      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret(),
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#4f39f6',
            colorText: '#0a0a0a',
            colorDanger: '#ff383c',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '12px',
          },
        },
      });

      this.paymentElement = this.elements.create('payment', {
        layout: 'tabs',
        paymentMethodOrder: order,
      });

      this.paymentElement.on('focus', () => this.elementFocused.set(true));
      this.paymentElement.on('blur', () => this.elementFocused.set(false));
      this.paymentElement.on('change', (e) => {
        if (e.complete) {
          this.errorMessage.set('');
        }
      });
      this.paymentElement.on('ready', () => this.isReady.set(true));

      this.paymentElement.mount(this.paymentElementRef.nativeElement);

      // Wallet (Apple Pay / Google Pay) button above the card form.
      await this.setupWalletButton();
    } catch (err) {
      this.fail((err as Error)?.message ?? 'Failed to initialize payment');
    }
  }

  private async setupWalletButton(): Promise<void> {
    if (!this.stripe || !this.elements) return;
    if (!this.amount() || this.amount() <= 0) return;

    this.paymentRequest = this.stripe.paymentRequest({
      country: this.country(),
      currency: this.currency(),
      total: { label: 'Cyna', amount: this.amount() },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const canMake = await this.paymentRequest.canMakePayment();
    if (!canMake) {
      this.showWalletButton.set(false);
      return;
    }

    this.showWalletButton.set(true);
    // Wait for the host element to render after the signal flip.
    setTimeout(() => {
      if (!this.elements || !this.walletButtonRef) return;
      this.prButton = this.elements.create('paymentRequestButton', {
        paymentRequest: this.paymentRequest!,
      });
      this.prButton.mount(this.walletButtonRef.nativeElement);
    }, 0);

    this.paymentRequest.on('paymentmethod', async (ev) => {
      if (!this.stripe) {
        ev.complete('fail');
        return;
      }
      const { error: confirmError } = await this.stripe.confirmCardPayment(
        this.clientSecret(),
        { payment_method: ev.paymentMethod.id },
        { handleActions: false },
      );
      if (confirmError) {
        ev.complete('fail');
        this.fail(confirmError.message ?? 'Wallet payment failed');
        return;
      }
      ev.complete('success');
      // If 3DS or another action is required, finish it after the sheet closes.
      const { error: actionError } = await this.stripe.confirmCardPayment(
        this.clientSecret(),
      );
      if (actionError) {
        this.fail(actionError.message ?? 'Wallet payment failed');
        return;
      }
      this.paymentSuccess.emit();
    });
  }

  /**
   * Confirms the payment using the inline Payment Element.
   * Returns `{ success, error? }` so the host page can route on success.
   */
  async submit(): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe || !this.elements) {
      return { success: false, error: 'Stripe not initialized' };
    }
    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    if (error) {
      const msg = error.message ?? 'Payment failed';
      this.errorMessage.set(msg);
      this.paymentError.emit(msg);
      return { success: false, error: msg };
    }
    return { success: true };
  }

  private fail(msg: string): void {
    this.errorMessage.set(msg);
    this.paymentError.emit(msg);
  }

  ngOnDestroy(): void {
    this.paymentElement?.destroy();
    this.prButton?.destroy();
  }
}
