import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthStore } from '@core/stores/auth.store';
import { UserResponse } from '@core/interfaces/auth.interface';

type AccountTab =
  | 'account'
  | 'security'
  | 'billing'
  | 'addresses'
  | 'preferences';

@Component({
  selector: 'app-dashboard-account',
  templateUrl: './dashboard-account.page.html',
  standalone: false,
})
export class DashboardAccountPage implements ViewWillEnter {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  user$ = this.authStore.user$;
  error$ = this.authStore.error$;

  activeTab = signal<AccountTab>('account');
  currentLanguage = signal<'fr' | 'en'>('fr');
  currentUser = signal<UserResponse | null>(null);
  languageError = signal<string | null>(null);
  languageSaved = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const rawTab = params.get('tab');
        const legacyRedirect = this.legacyTabRedirect(rawTab);
        if (legacyRedirect) {
          this.router.navigate(['/dashboard/account', legacyRedirect], {
            replaceUrl: true,
          });
          return;
        }
        const tab = this.toAccountTab(rawTab);
        this.activeTab.set(tab);
        if (rawTab && rawTab !== tab) {
          this.router.navigate(['/dashboard/account'], { replaceUrl: true });
        }
      });
  }

  ionViewWillEnter(): void {
    this.authStore.getProfile().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.currentLanguage.set(
          this.normalizeLanguage(user.preferredLanguage),
        );
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

  onProfileSubmit(event: {
    data: {
      firstName: string;
      lastName: string;
      companyName: string;
      vatNumber: string;
    };
    onSuccess: () => void;
    onError: (message: string) => void;
  }): void {
    this.authStore.clearError();

    this.authStore.updateProfile(event.data).subscribe({
      next: (response) => {
        this.currentUser.set(response.user);
        event.onSuccess();
      },
      error: () => {
        event.onError(this.authStore.errorValue ?? 'Failed to save profile');
      },
    });
  }

  onPasswordSubmit(event: {
    data: { currentPassword: string; newPassword: string };
    onSuccess: () => void;
    onError: (message: string) => void;
  }): void {
    this.authStore.updatePassword(event.data).subscribe({
      next: () => {
        event.onSuccess();
        setTimeout(() => {
          this.authStore.logout();
        }, 2000);
      },
      error: () => {
        event.onError(this.authStore.errorValue ?? 'Failed to update password');
      },
    });
  }

  onLanguageChange(language: 'fr' | 'en'): void {
    this.authStore.clearError();
    this.languageError.set(null);

    this.authStore.updateLanguage({ preferredLanguage: language }).subscribe({
      next: () => {
        this.currentLanguage.set(language);
        document.cookie = `cyna_lang=${language};path=/;max-age=31536000;Secure;SameSite=Strict`;
        this.languageSaved.set(true);
        setTimeout(() => this.languageSaved.set(false), 2000);
      },
      error: () => {
        this.languageError.set(
          this.authStore.errorValue ?? 'Failed to update language',
        );
      },
    });
  }

  private toAccountTab(tab: string | null): AccountTab {
    switch (tab) {
      case 'security':
      case 'billing':
      case 'addresses':
      case 'preferences':
        return tab;
      default:
        return 'account';
    }
  }

  private legacyTabRedirect(raw: string | null): AccountTab | null {
    if (raw === 'privacy') return 'security';
    if (raw === 'appearance') return 'preferences';
    return null;
  }

  private normalizeLanguage(lang: string | null | undefined): 'fr' | 'en' {
    const normalized = (lang ?? 'fr').toLowerCase();
    return normalized === 'en' ? 'en' : 'fr';
  }
}
