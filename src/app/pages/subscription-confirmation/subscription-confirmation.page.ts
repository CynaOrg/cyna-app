import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SubscriptionApiService } from '@core/services/subscription-api.service';
import { Subscription } from '@core/interfaces';
import { AuthStore } from '@core/stores/auth.store';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  host: { class: 'ion-page' },
  standalone: false,
  selector: 'app-subscription-confirmation',
  templateUrl: './subscription-confirmation.page.html',
})
export class SubscriptionConfirmationPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscriptionApi = inject(SubscriptionApiService);
  private readonly authStore = inject(AuthStore);

  private readonly header = inject(MobileHeaderService);
  isNative = isNativeCapacitor();

  ionViewWillEnter(): void {
    if (this.isNative && !this.isDashboard) {
      this.header.configure({
        showBack: false,
        title: 'SUBSCRIPTION_CONFIRMATION.TITLE',
        showSearch: true,
        showCart: true,
        visible: true,
      });
    } else {
      this.header.hide();
    }
  }

  get isDashboard(): boolean {
    return this.router.url.startsWith('/dashboard');
  }

  scrolled = false;

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
  }

  subscription = signal<Subscription | null>(null);
  isLoading = signal(true);
  isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    const navState =
      this.router.getCurrentNavigation()?.extras?.state || history.state;

    if (navState?.productName) {
      this.subscription.set({
        id,
        productId: navState.productId ?? '',
        productName: navState.productName,
        productImageUrl: navState.productImageUrl ?? null,
        status: navState.status ?? 'active',
        price: navState.price ?? 0,
        billingPeriod: navState.billingPeriod ?? 'monthly',
        currentPeriodStart:
          navState.currentPeriodStart ?? new Date().toISOString(),
        currentPeriodEnd:
          navState.currentPeriodEnd ??
          this.computeNextBilling(navState.billingPeriod),
        cancelAtPeriodEnd: false,
      });
      this.isLoading.set(false);
      return;
    }

    this.subscriptionApi
      .getSubscriptions()
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((subs) => {
        this.subscription.set(subs.find((s) => s.id === id) ?? null);
        this.isLoading.set(false);
      });
  }

  private computeNextBilling(period?: string): string {
    const d = new Date();
    if (period === 'yearly') {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString();
  }
}
