import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorUser,
  phosphorLock,
  phosphorMapPin,
  phosphorCreditCard,
  phosphorGear,
  phosphorSignOut,
  phosphorCheck,
} from '@ng-icons/phosphor-icons/regular';
import { AuthStore } from '@core/stores/auth.store';
import { UserResponse } from '@core/interfaces/auth.interface';
import { NativePageHeaderComponent } from '../../../components/native-page-header.component';
import { SkeletonListComponent } from '../../../components/skeleton-list.component';
import { HapticOnDirective } from '../../../directives/haptic-on.directive';

type AccountTab =
  | 'account'
  | 'security'
  | 'billing'
  | 'addresses'
  | 'preferences';

interface TabDef {
  key: AccountTab;
  icon: string;
  label: string;
}

/**
 * Native account / settings page mounted at `/m/dashboard/account`.
 *
 * Adapted from the web `DashboardAccountPage`'s 5-tab design (account,
 * security, billing, addresses, preferences) collapsed into a vertical
 * mobile-friendly segmented control.
 */
@Component({
  selector: 'app-dashboard-account-native',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgIconComponent,
    NativePageHeaderComponent,
    SkeletonListComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({
      phosphorUser,
      phosphorLock,
      phosphorMapPin,
      phosphorCreditCard,
      phosphorGear,
      phosphorSignOut,
      phosphorCheck,
    }),
  ],
  templateUrl: './dashboard-account-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAccountNativePage implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<UserResponse | null>(null);
  readonly activeTab = signal<AccountTab>('account');
  readonly isLoading = signal(true);
  readonly savedFlash = signal<string | null>(null);
  readonly profileError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);
  readonly currentLanguage = signal<'fr' | 'en'>('fr');

  // Profile form fields (kept simple; binds through ngModel)
  firstName = '';
  lastName = '';
  companyName = '';
  vatNumber = '';

  // Password form fields
  currentPassword = '';
  newPassword = '';

  readonly tabs: TabDef[] = [
    { key: 'account', icon: 'phosphorUser', label: 'Profil' },
    { key: 'security', icon: 'phosphorLock', label: 'Sécurité' },
    { key: 'addresses', icon: 'phosphorMapPin', label: 'Adresses' },
    { key: 'billing', icon: 'phosphorCreditCard', label: 'Paiement' },
    { key: 'preferences', icon: 'phosphorGear', label: 'Préférences' },
  ];

  ngOnInit(): void {
    this.authStore.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => {
        this.user.set(u);
        if (u) {
          this.firstName = u.firstName ?? '';
          this.lastName = u.lastName ?? '';
          this.companyName = u.companyName ?? '';
          this.vatNumber = u.vatNumber ?? '';
          this.currentLanguage.set(
            String(u.preferredLanguage).toLowerCase() === 'en' ? 'en' : 'fr',
          );
        }
      });

    this.authStore.getProfile().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  setTab(tab: AccountTab): void {
    this.activeTab.set(tab);
    this.profileError.set(null);
    this.passwordError.set(null);
  }

  saveProfile(): void {
    this.profileError.set(null);
    this.authStore
      .updateProfile({
        firstName: this.firstName,
        lastName: this.lastName,
        companyName: this.companyName,
        vatNumber: this.vatNumber,
      })
      .subscribe({
        next: () => this.flash('Profil enregistré'),
        error: () =>
          this.profileError.set(
            this.authStore.errorValue ?? 'Erreur enregistrement',
          ),
      });
  }

  savePassword(): void {
    this.passwordError.set(null);
    if (!this.currentPassword || !this.newPassword) {
      this.passwordError.set('Champs requis');
      return;
    }
    this.authStore
      .updatePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.flash('Mot de passe mis à jour');
          this.currentPassword = '';
          this.newPassword = '';
        },
        error: () =>
          this.passwordError.set(
            this.authStore.errorValue ?? 'Erreur mise à jour',
          ),
      });
  }

  changeLanguage(lang: 'fr' | 'en'): void {
    if (lang === this.currentLanguage()) return;
    this.authStore.updateLanguage({ preferredLanguage: lang }).subscribe({
      next: () => {
        this.currentLanguage.set(lang);
        this.flash('Langue mise à jour');
      },
      error: () => {
        // Error toast is handled via the store's error stream upstream.
      },
    });
  }

  logout(): void {
    this.authStore.logout();
  }

  private flash(message: string): void {
    this.savedFlash.set(message);
    setTimeout(() => {
      if (this.savedFlash() === message) this.savedFlash.set(null);
    }, 2000);
  }
}
