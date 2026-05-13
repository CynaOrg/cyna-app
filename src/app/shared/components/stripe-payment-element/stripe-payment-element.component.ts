import {
  Component,
  input,
  output,
  signal,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  Stripe,
  StripeElements,
  StripeCardNumberElement,
  StripeCardExpiryElement,
  StripeCardCvcElement,
  StripePaymentRequestButtonElement,
  PaymentRequest,
} from '@stripe/stripe-js';
import { StripeService } from '@core/services/stripe.service';

@Component({
  selector: 'app-stripe-payment-element',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex flex-col gap-4 relative">
      <!-- Apple Pay / Google Pay button (only shown when wallet available) -->
      @if (canPayWithWallet()) {
        <div class="flex flex-col gap-4">
          <div #paymentRequestButton></div>
          <div class="flex items-center gap-3">
            <div class="h-px bg-text-muted/20 flex-1"></div>
            <span class="text-xs text-text-muted uppercase tracking-wide">{{
              'PAYMENT.OR_PAY_WITH_CARD' | translate
            }}</span>
            <div class="h-px bg-text-muted/20 flex-1"></div>
          </div>
        </div>
      }

      <!-- Card number -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-normal text-black">
          {{ 'CHECKOUT.CARD_NUMBER' | translate }}
        </label>
        <div
          #cardNumber
          class="h-14 w-full rounded-full border bg-input-bg px-5 flex items-center [&>div]:w-full transition-all"
          [class.border-primary]="cardNumberFocused()"
          [class.border-input-border]="
            !cardNumberFocused() && !cardNumberError()
          "
          [class.border-error]="cardNumberError()"
          [style.box-shadow]="
            cardNumberFocused() ? '0 0 0 3px rgba(79,57,246,0.06)' : 'none'
          "
        ></div>
      </div>

      <!-- Expiry + CVC -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-normal text-black">
            {{ 'CHECKOUT.CARD_EXPIRY' | translate }}
          </label>
          <div
            #cardExpiry
            class="h-14 w-full rounded-full border bg-input-bg px-5 flex items-center [&>div]:w-full transition-all"
            [class.border-primary]="cardExpiryFocused()"
            [class.border-input-border]="
              !cardExpiryFocused() && !cardExpiryError()
            "
            [class.border-error]="cardExpiryError()"
            [style.box-shadow]="
              cardExpiryFocused() ? '0 0 0 3px rgba(79,57,246,0.06)' : 'none'
            "
          ></div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-normal text-black">
            {{ 'CHECKOUT.CARD_CVC' | translate }}
          </label>
          <div
            #cardCvc
            class="h-14 w-full rounded-full border bg-input-bg px-5 flex items-center [&>div]:w-full transition-all"
            [class.border-primary]="cardCvcFocused()"
            [class.border-input-border]="!cardCvcFocused() && !cardCvcError()"
            [class.border-error]="cardCvcError()"
            [style.box-shadow]="
              cardCvcFocused() ? '0 0 0 3px rgba(79,57,246,0.06)' : 'none'
            "
          ></div>
        </div>
      </div>

      <!-- Secured by Stripe -->
      <div class="flex items-center gap-1.5">
        <svg
          class="w-3.5 h-3.5 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
        <span class="text-[11px] text-text-muted">
          {{ 'CHECKOUT.SECURED_BY_STRIPE' | translate }}
        </span>
      </div>

      @if (errorMessage) {
        <p class="text-sm text-error">{{ errorMessage }}</p>
      }
    </div>
  `,
})
export class StripePaymentElementComponent implements OnInit, OnDestroy {
  clientSecret = input.required<string>();
  mode = input<'payment' | 'setup'>('payment');
  /** Amount in the smallest currency unit (e.g. cents for EUR). Required to enable Apple Pay / wallet. */
  amount = input<number>(0);
  /** ISO 4217 currency code (lowercase). Defaults to 'eur'. */
  currency = input<string>('eur');
  /** Country code (ISO 3166-1 alpha-2). Defaults to 'FR'. */
  country = input<string>('FR');
  /** Label shown in the wallet sheet. Defaults to 'Cyna'. */
  walletLabel = input<string>('Cyna');

  paymentReady = output<void>();
  paymentError = output<string>();
  /** Emitted when a wallet payment (Apple Pay / Google Pay) succeeds. */
  paymentSuccess = output<void>();

  @ViewChild('cardNumber', { static: true })
  cardNumberRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cardExpiry', { static: true })
  cardExpiryRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cardCvc', { static: true })
  cardCvcRef!: ElementRef<HTMLDivElement>;
  @ViewChild('paymentRequestButton')
  paymentRequestButtonRef?: ElementRef<HTMLDivElement>;

  private readonly stripeService = inject(StripeService);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardNumberElement: StripeCardNumberElement | null = null;
  private cardExpiryElement: StripeCardExpiryElement | null = null;
  private cardCvcElement: StripeCardCvcElement | null = null;
  private paymentRequest: PaymentRequest | null = null;
  private paymentRequestButtonElement: StripePaymentRequestButtonElement | null =
    null;

  isLoading = true;
  errorMessage = '';

  cardNumberFocused = signal(false);
  cardExpiryFocused = signal(false);
  cardCvcFocused = signal(false);
  cardNumberError = signal(false);
  cardExpiryError = signal(false);
  cardCvcError = signal(false);
  /** True when the device supports Apple Pay or Google Pay through Stripe. */
  canPayWithWallet = signal(false);

  private readonly baseStyle = {
    base: {
      fontSize: '14px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0a0a0a',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ff383c',
    },
  };

  async ngOnInit(): Promise<void> {
    try {
      this.stripe = await this.stripeService.getStripe();
      if (!this.stripe) {
        this.errorMessage = 'Failed to load Stripe';
        this.paymentError.emit(this.errorMessage);
        return;
      }

      this.elements = this.stripe.elements({
        locale: this.stripeService.getStripeLocale(),
      });

      // Card Number
      this.cardNumberElement = this.elements.create('cardNumber', {
        style: this.baseStyle,
        showIcon: true,
      });
      this.cardNumberElement.mount(this.cardNumberRef.nativeElement);
      this.cardNumberElement.on('focus', () =>
        this.cardNumberFocused.set(true),
      );
      this.cardNumberElement.on('blur', () =>
        this.cardNumberFocused.set(false),
      );
      this.cardNumberElement.on('change', (event) => {
        this.cardNumberError.set(!!event.error);
        if (event.error) {
          this.errorMessage = event.error.message;
        } else {
          this.clearErrorIfNone();
        }
      });
      this.cardNumberElement.on('ready', () => {
        this.isLoading = false;
        this.paymentReady.emit();
      });

      // Card Expiry
      this.cardExpiryElement = this.elements.create('cardExpiry', {
        style: this.baseStyle,
      });
      this.cardExpiryElement.mount(this.cardExpiryRef.nativeElement);
      this.cardExpiryElement.on('focus', () =>
        this.cardExpiryFocused.set(true),
      );
      this.cardExpiryElement.on('blur', () =>
        this.cardExpiryFocused.set(false),
      );
      this.cardExpiryElement.on('change', (event) => {
        this.cardExpiryError.set(!!event.error);
        if (event.error) {
          this.errorMessage = event.error.message;
        } else {
          this.clearErrorIfNone();
        }
      });

      // Card CVC
      this.cardCvcElement = this.elements.create('cardCvc', {
        style: this.baseStyle,
      });
      this.cardCvcElement.mount(this.cardCvcRef.nativeElement);
      this.cardCvcElement.on('focus', () => this.cardCvcFocused.set(true));
      this.cardCvcElement.on('blur', () => this.cardCvcFocused.set(false));
      this.cardCvcElement.on('change', (event) => {
        this.cardCvcError.set(!!event.error);
        if (event.error) {
          this.errorMessage = event.error.message;
        } else {
          this.clearErrorIfNone();
        }
      });

      // Wallet (Apple Pay / Google Pay) — only initializes for `payment`
      // mode with a non-zero amount. On simulator and on devices without
      // Wallet enrolled, canMakePayment() resolves to null and the button
      // stays hidden — this is the expected behavior.
      if (this.mode() === 'payment' && this.amount() > 0) {
        await this.initWalletPayment();
      }
    } catch (err) {
      this.isLoading = false;
      this.errorMessage = 'Failed to initialize payment form';
      this.paymentError.emit(this.errorMessage);
    }
  }

  private async initWalletPayment(): Promise<void> {
    if (!this.stripe || !this.elements) return;

    try {
      const paymentRequest = this.stripe.paymentRequest({
        country: this.country(),
        currency: this.currency().toLowerCase(),
        total: {
          label: this.walletLabel(),
          amount: this.amount(),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const result = await paymentRequest.canMakePayment();
      if (!result) {
        // No Apple Pay / Google Pay available — button stays hidden.
        return;
      }

      this.paymentRequest = paymentRequest;
      this.canPayWithWallet.set(true);

      // Defer the mount so Angular has time to render the @if branch
      // and the #paymentRequestButton ref is available.
      setTimeout(() => this.mountPaymentRequestButton(), 0);

      paymentRequest.on('paymentmethod', async (ev) => {
        if (!this.stripe) {
          ev.complete('fail');
          return;
        }
        const { error: confirmError, paymentIntent } =
          await this.stripe.confirmCardPayment(
            this.clientSecret(),
            { payment_method: ev.paymentMethod.id },
            { handleActions: false },
          );

        if (confirmError) {
          ev.complete('fail');
          this.errorMessage = confirmError.message ?? 'Payment failed';
          this.paymentError.emit(this.errorMessage);
          return;
        }

        ev.complete('success');

        if (paymentIntent?.status === 'requires_action') {
          // 3DS — let Stripe handle the action flow.
          const { error } = await this.stripe.confirmCardPayment(
            this.clientSecret(),
          );
          if (error) {
            this.errorMessage = error.message ?? 'Payment failed';
            this.paymentError.emit(this.errorMessage);
            return;
          }
        }
        this.paymentSuccess.emit();
      });
    } catch (err) {
      // Silently ignore: wallet init failure must not break the card form.
      // eslint-disable-next-line no-console
      console.warn('[StripePaymentElement] Wallet init skipped:', err);
    }
  }

  private mountPaymentRequestButton(): void {
    if (
      !this.elements ||
      !this.paymentRequest ||
      !this.paymentRequestButtonRef
    ) {
      return;
    }
    this.paymentRequestButtonElement = this.elements.create(
      'paymentRequestButton',
      {
        paymentRequest: this.paymentRequest,
        style: {
          paymentRequestButton: {
            type: 'default',
            theme: 'dark',
            height: '48px',
          },
        },
      },
    );
    this.paymentRequestButtonElement.mount(
      this.paymentRequestButtonRef.nativeElement,
    );
  }

  private clearErrorIfNone(): void {
    if (
      !this.cardNumberError() &&
      !this.cardExpiryError() &&
      !this.cardCvcError()
    ) {
      this.errorMessage = '';
    }
  }

  ngOnDestroy(): void {
    this.cardNumberElement?.destroy();
    this.cardExpiryElement?.destroy();
    this.cardCvcElement?.destroy();
    this.paymentRequestButtonElement?.destroy();
  }

  async submit(): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe || !this.cardNumberElement) {
      return { success: false, error: 'Stripe not initialized' };
    }

    let error;

    if (this.mode() === 'setup') {
      ({ error } = await this.stripe.confirmCardSetup(this.clientSecret(), {
        payment_method: { card: this.cardNumberElement },
      }));
    } else {
      ({ error } = await this.stripe.confirmCardPayment(this.clientSecret(), {
        payment_method: { card: this.cardNumberElement },
      }));
    }

    if (error) {
      this.errorMessage = error.message ?? 'Payment failed';
      this.paymentError.emit(this.errorMessage);
      return { success: false, error: this.errorMessage };
    }

    return { success: true };
  }
}
