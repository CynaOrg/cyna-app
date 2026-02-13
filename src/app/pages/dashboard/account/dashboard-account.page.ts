import { Component, DestroyRef, inject, signal } from '@angular/core';
import { IonViewWillEnter } from '@ionic/angular';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthStore } from '@core/stores/auth.store';
import { Order, Subscription } from '@core/interfaces';
import { UserResponse } from '@core/interfaces/auth.interface';
import { SubscriptionStore } from '@core/stores/subscription.store';
import { OrderStore } from '@core/stores/order.store';
import { combineLatest, map } from 'rxjs';

type AccountTab =
  | 'account'
  | 'billing'
  | 'appearance'
  | 'privacy';

@Component({
  selector: 'app-dashboard-account',
  templateUrl: './dashboard-account.page.html',
  standalone: false,
})
export class DashboardAccountPage implements IonViewWillEnter {
  private readonly authStore = inject(AuthStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly orderStore = inject(OrderStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  user$ = this.authStore.user$;
  isLoading$ = this.authStore.isLoading$;
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
    map(
      ([subscriptionsError, ordersError]) =>
        subscriptionsError || ordersError,
    ),
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

  profileForm: FormGroup;
  profileSuccess = signal(false);
  profileLoading = signal(false);
  isEditMode = signal(false);

  passwordForm: FormGroup;
  passwordSuccess = signal(false);
  passwordError = signal<string | null>(null);
  passwordLoading = signal(false);

  currentLanguage = signal<'fr' | 'en'>('fr');
  languageSuccess = signal(false);
  languageLoading = signal(false);

  activeTab = signal<AccountTab>('account');

  showDeleteConfirm = signal(false);
  deletePassword = signal('');
  deleteError = signal<string | null>(null);
  deleteLoading = signal(false);

  private readonly passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      companyName: ['', [Validators.maxLength(255)]],
      vatNumber: ['', [Validators.maxLength(50)]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [Validators.required, Validators.pattern(this.passwordPattern)],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );

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

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ionViewWillEnter(): void {
    this.isEditMode.set(false);
    this.authStore.getProfile().subscribe({
      next: (user) => this.populateForm(user),
      error: () => {
        console.error('Failed to load profile');
      },
    });
  }

  private populateForm(user: UserResponse): void {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      vatNumber: user.vatNumber || '',
    });
    this.currentLanguage.set(this.normalizeLanguage(user.preferredLanguage));
  }

  enterEditMode(): void {
    this.isEditMode.set(true);
  }

  exitEditMode(): void {
    this.isEditMode.set(false);
    this.authStore.getProfile().subscribe({
      next: (user) => this.populateForm(user),
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) return;

    this.profileSuccess.set(false);
    this.profileLoading.set(true);
    this.authStore.clearError();

    this.authStore.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.profileSuccess.set(true);
        this.isEditMode.set(false);
        this.profileLoading.set(false);
        setTimeout(() => this.profileSuccess.set(false), 3000);
      },
      error: () => {
        this.profileLoading.set(false);
      },
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) return 'PROFILE.VALIDATION.REQUIRED';
    if (control.errors['maxlength']) return 'PROFILE.VALIDATION.MAX_LENGTH';

    return '';
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.passwordSuccess.set(false);
    this.passwordError.set(null);
    this.passwordLoading.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authStore.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
        this.passwordLoading.set(false);
        setTimeout(() => {
          this.passwordSuccess.set(false);
          this.authStore.logout();
        }, 2000);
      },
      error: () => {
        this.passwordError.set(this.authStore.errorValue);
        this.passwordLoading.set(false);
      },
    });
  }

  getPasswordFieldError(fieldName: string): string {
    const control = this.passwordForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) return 'PROFILE.VALIDATION.REQUIRED';
    if (control.errors['pattern'])
      return 'PROFILE.SECURITY.PASSWORD_REQUIREMENTS';

    return '';
  }

  get passwordMismatchError(): boolean {
    return (
      this.passwordForm.errors?.['passwordMismatch'] &&
      this.passwordForm.get('confirmPassword')?.touched
    );
  }

  onLanguageChange(language: 'fr' | 'en'): void {
    if (language === this.currentLanguage()) return;

    this.languageSuccess.set(false);
    this.languageLoading.set(true);
    this.authStore.clearError();

    this.authStore.updateLanguage({ preferredLanguage: language }).subscribe({
      next: () => {
        this.currentLanguage.set(this.normalizeLanguage(language));
        this.languageSuccess.set(true);
        this.languageLoading.set(false);
        // Update cookie with Secure flag
        document.cookie = `cyna_lang=${language};path=/;max-age=31536000;Secure;SameSite=Strict`;
        setTimeout(() => this.languageSuccess.set(false), 3000);
      },
      error: () => {
        this.languageLoading.set(false);
      },
    });
  }

  showDeleteConfirmation(): void {
    this.showDeleteConfirm.set(true);
    this.deletePassword.set('');
    this.deleteError.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletePassword.set('');
    this.deleteError.set(null);
  }

  onDeletePasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.deletePassword.set(input.value);
  }

  onDeleteAccount(): void {
    if (!this.deletePassword()) return;

    this.deleteError.set(null);
    this.deleteLoading.set(true);
    this.authStore.clearError();

    this.authStore
      .deleteAccount({ password: this.deletePassword() })
      .subscribe({
        next: () => {
          this.deleteLoading.set(false);
          this.authStore.clearSession();
        },
        error: () => {
          this.deleteError.set(this.authStore.errorValue);
          this.deleteLoading.set(false);
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

  getSubscriptionStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#34c759';
      case 'past_due':
        return '#ff9500';
      case 'cancelled':
        return '#ff383c';
      case 'paused':
        return '#9ca3af';
      default:
        return '#9ca3af';
    }
  }

  getOrderStatusColor(status: string): string {
    switch (status) {
      case 'paid':
      case 'completed':
        return '#34c759';
      case 'pending':
      case 'processing':
        return '#ff9500';
      case 'shipped':
        return '#007aff';
      case 'cancelled':
      case 'refunded':
        return '#ff383c';
      default:
        return '#9ca3af';
    }
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
