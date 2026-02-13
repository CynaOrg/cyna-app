import { Component, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { IonViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthStore } from '@core/stores/auth.store';
import { Subscription } from '@core/interfaces';
import { UserResponse } from '@core/interfaces/auth.interface';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { OrderStore } from '@core/stores/order.store';
import { combineLatest, map } from 'rxjs';
import { AccountTabComponent } from './components/account-tab/account-tab.component';
import { AppearanceTabComponent } from './components/appearance-tab/appearance-tab.component';
import { PrivacyTabComponent } from './components/privacy-tab/privacy-tab.component';

type AccountTab = 'account' | 'billing' | 'appearance' | 'privacy';

@Component({
  selector: 'app-dashboard-account',
  templateUrl: './dashboard-account.page.html',
  standalone: false,
})
export class DashboardAccountPage implements IonViewWillEnter {
  @ViewChild(AccountTabComponent) accountTab!: AccountTabComponent;
  @ViewChild(AppearanceTabComponent) appearanceTab!: AppearanceTabComponent;
  @ViewChild(PrivacyTabComponent) privacyTab!: PrivacyTabComponent;

  private readonly authStore = inject(AuthStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly orderStore = inject(OrderStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  user$ = this.authStore.user$;
  error$ = this.authStore.error$;

  subscriptions$ = this.subscriptionStore.subscriptions$;
  subscriptionsLoading$ = this.subscriptionStore.isLoading$;
  subscriptionsError$ = this.subscriptionStore.error$;

  orders$ = this.orderStore.orders$;
  ordersLoading$ = this.orderStore.isLoading$;
  ordersError$ = this.orderStore.error$;

  billingError$ = combineLatest([
    this.subscriptionsError$,
    this.ordersError$,
  ]).pipe(
    map(([subscriptionsError, ordersError]) => subscriptionsError || ordersError),
  );

  ongoingSubscriptions$ = this.subscriptions$.pipe(
    map((subscriptions) =>
      [...subscriptions]
        .filter((subscription) => this.isOngoingSubscription(subscription))
        .sort(
          (a, b) =>
            this.toTimestamp(a.currentPeriodEnd, Number.MAX_SAFE_INTEGER) -
            this.toTimestamp(b.currentPeriodEnd, Number.MAX_SAFE_INTEGER),
        ),
    ),
  );

  upcomingRenewals$ = this.ongoingSubscriptions$.pipe(
    map((subscriptions) =>
      subscriptions
        .filter((subscription) => Boolean(subscription.currentPeriodEnd))
        .slice(0, 5),
    ),
  );

  pastOrders$ = this.orders$.pipe(
    map((orders) =>
      [...orders]
        .sort(
          (a, b) =>
            this.toTimestamp(b.createdAt, 0) - this.toTimestamp(a.createdAt, 0),
        )
        .slice(0, 5),
    ),
  );

  activeTab = signal<AccountTab>('account');
  currentLanguage = signal<'fr' | 'en'>('fr');
  currentUser = signal<UserResponse | null>(null);
  profileError = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const rawTab = params.get('tab');
        const tab = this.toAccountTab(rawTab);
        this.activeTab.set(tab);
        if (rawTab && rawTab !== tab) {
          this.router.navigate(['/dashboard/account'], { replaceUrl: true });
        }

        if (tab === 'billing') {
          this.loadBillingData();
        }
      });
  }

  ionViewWillEnter(): void {
    this.authStore.getProfile().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.currentLanguage.set(this.normalizeLanguage(user.preferredLanguage));
        this.profileError.set(null);
      },
      error: () => {
        this.profileError.set('Failed to load profile');
      },
    });
  }

  onTabClick(tab: AccountTab): void {
    if (tab === this.activeTab()) return;

    if (tab === 'account') {
      this.router.navigate(['/dashboard/account']);
      return;
    }

    this.router.navigate(['/dashboard/account', tab]);
  }

  onProfileSubmit(data: {
    firstName: string;
    lastName: string;
    companyName: string;
    vatNumber: string;
  }): void {
    this.authStore.clearError();

    this.authStore.updateProfile(data).subscribe({
      next: (response) => {
        this.currentUser.set(response.user);
        this.accountTab?.onProfileSuccess();
      },
      error: () => {
        this.accountTab?.onProfileError();
      },
    });
  }

  onPasswordSubmit(data: { currentPassword: string; newPassword: string }): void {
    this.authStore.updatePassword(data).subscribe({
      next: () => {
        this.accountTab?.onPasswordSuccess();
        setTimeout(() => {
          this.authStore.logout();
        }, 2000);
      },
      error: () => {
        this.accountTab?.onPasswordError(this.authStore.errorValue || 'Error');
      },
    });
  }

  onLanguageChange(language: 'fr' | 'en'): void {
    this.authStore.clearError();

    this.authStore.updateLanguage({ preferredLanguage: language }).subscribe({
      next: () => {
        this.currentLanguage.set(language);
        document.cookie = `cyna_lang=${language};path=/;max-age=31536000;Secure;SameSite=Strict`;
        this.appearanceTab?.onLanguageSuccess();
      },
      error: () => {
        this.appearanceTab?.onLanguageError();
      },
    });
  }

  onDeleteAccount(password: string): void {
    this.authStore.clearError();

    this.authStore.deleteAccount({ password }).subscribe({
      next: () => {
        this.privacyTab?.onDeleteSuccess();
        this.authStore.clearSession();
      },
      error: () => {
        this.privacyTab?.onDeleteError(this.authStore.errorValue || 'Error');
      },
    });
  }

  private loadBillingData(): void {
    this.subscriptionStore.loadSubscriptions();
    this.orderStore.loadOrders();
  }

  private toAccountTab(tab: string | null): AccountTab {
    switch (tab) {
      case 'billing':
      case 'appearance':
      case 'privacy':
        return tab;
      default:
        return 'account';
    }
  }

  private normalizeLanguage(lang: string | null | undefined): 'fr' | 'en' {
    return String(lang).toLowerCase() === 'en' ? 'en' : 'fr';
  }

  private isOngoingSubscription(subscription: Subscription): boolean {
    return subscription.status !== 'cancelled';
  }

  private toTimestamp(
    value: string | null | undefined,
    fallback: number,
  ): number {
    const timestamp = value ? Date.parse(value) : NaN;
    return Number.isFinite(timestamp) ? timestamp : fallback;
  }
}