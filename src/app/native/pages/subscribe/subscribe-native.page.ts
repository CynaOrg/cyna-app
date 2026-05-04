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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorCheckCircle,
  phosphorShieldCheck,
} from '@ng-icons/phosphor-icons/regular';
import { EMPTY, catchError } from 'rxjs';
import { Address, ProductDetail } from '@core/interfaces';
import { ProductStore } from '@core/stores/product.store';
import { SubscriptionApiService } from '@core/services/subscription-api.service';
import { NativePageHeaderComponent } from '../../components/native-page-header.component';
import { HapticOnDirective } from '../../directives/haptic-on.directive';
import {
  NativeStripePaymentElementComponent,
} from '../../components/native-stripe-payment-element.component';

/**
 * Native subscribe page mounted at `/m/subscribe/:slug`.
 *
 * Handles the SaaS subscription tunnel:
 * - displays the chosen product, lets the user toggle monthly / yearly
 *   billing (with a savings badge),
 * - collects a billing address,
 * - creates the subscription server-side and confirms the first invoice
 *   with the native Stripe Payment Element (Apple Pay first on iOS),
 * - on success routes to the dashboard subscriptions list.
 */
@Component({
  selector: 'app-subscribe-native',
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
      phosphorCheckCircle,
      phosphorShieldCheck,
    }),
  ],
  templateUrl: './subscribe-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeNativePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productStore = inject(ProductStore);
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly fb = inject(FormBuilder);

  readonly product = signal<ProductDetail | null>(null);
  readonly isLoadingProduct = signal(true);
  readonly billingPeriod = signal<'monthly' | 'yearly'>('monthly');
  readonly clientSecret = signal<string | null>(null);
  readonly subscriptionId = signal<string | null>(null);
  readonly isCreating = signal(false);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly paymentError = signal('');

  billingForm: FormGroup = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['FR', Validators.required],
  });

  @ViewChild('stripeElement')
  stripeElement?: NativeStripePaymentElementComponent;

  readonly currentPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return this.billingPeriod() === 'yearly'
      ? (p.priceYearly ?? 0)
      : (p.priceMonthly ?? 0);
  });

  readonly savingsPercent = computed(() => {
    const p = this.product();
    if (!p?.priceMonthly || !p?.priceYearly) return 0;
    const yearlyMonthly = p.priceYearly / 12;
    return Math.round((1 - yearlyMonthly / p.priceMonthly) * 100);
  });

  readonly totalCents = computed(() =>
    Math.round(this.currentPrice() * 1.2 * 100),
  );

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.router.navigateByUrl('/m/home');
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
          this.router.navigate(['/m/products', slug]);
          return;
        }
        this.product.set(product);
        this.isLoadingProduct.set(false);
      });
  }

  toggleBillingPeriod(period: 'monthly' | 'yearly'): void {
    this.billingPeriod.set(period);
  }

  createSubscription(): void {
    if (this.billingForm.invalid) {
      this.billingForm.markAllAsTouched();
      this.error.set('Adresse de facturation incomplète');
      return;
    }
    const p = this.product();
    if (!p) return;

    this.isCreating.set(true);
    this.error.set(null);

    this.subscriptionApi
      .createSubscription({
        productId: p.id,
        billingPeriod: this.billingPeriod(),
        billingAddress: this.billingForm.value as Address,
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

  onPaymentError(err: string): void {
    this.paymentError.set(err);
  }

  async onSubmit(): Promise<void> {
    if (!this.stripeElement || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.paymentError.set('');

    const result = await this.stripeElement.submit();
    if (result.success) {
      this.router.navigateByUrl('/m/dashboard/subscriptions');
    } else if (result.error) {
      this.paymentError.set(result.error);
    }

    this.isSubmitting.set(false);
  }
}
