import { Component, OnInit, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorPackage,
  phosphorReceipt,
  phosphorKey,
  phosphorMapPin,
  phosphorUser,
  phosphorShield,
  phosphorGear,
  phosphorCreditCard,
  phosphorFingerprint,
} from '@ng-icons/phosphor-icons/regular';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { MobileListItemComponent } from '@shared/components/mobile-list-item/mobile-list-item.component';
import { AuthStore } from '@core/stores/auth.store';
import { BiometricService } from '@core/services/biometric.service';
import { SecureStorageService } from '@core/services/secure-storage.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonicModule,
    TranslateModule,
    NgIconComponent,
    MobileHeaderComponent,
    NavbarComponent,
    MobileListItemComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorPackage,
      phosphorReceipt,
      phosphorKey,
      phosphorMapPin,
      phosphorUser,
      phosphorShield,
      phosphorGear,
      phosphorCreditCard,
      phosphorFingerprint,
    }),
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar
        [style.--padding-top]="0"
        [style.--padding-bottom]="0"
        [style.--padding-start]="0"
        [style.--padding-end]="0"
        [style.--min-height]="0"
      >
        <app-mobile-header variant="title" title="ACCOUNT.TITLE" />
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <!-- Section 1 — Mes données -->
      <h2
        class="px-6 pt-6 pb-2 text-xs uppercase tracking-wider text-text-muted"
      >
        {{ 'ACCOUNT.SECTION_DATA' | translate }}
      </h2>
      <div class="mx-4 my-2 rounded-xl bg-surface overflow-hidden">
        @for (item of section1Items; track item.route; let last = $last) {
          <app-mobile-list-item
            [icon]="item.icon"
            [label]="item.label"
            [routerLink]="item.route"
            [last]="last"
          />
        }
      </div>

      <!-- Section 2 — Mon profil -->
      <h2
        class="px-6 pt-6 pb-2 text-xs uppercase tracking-wider text-text-muted"
      >
        {{ 'ACCOUNT.SECTION_PROFILE' | translate }}
      </h2>
      <div class="mx-4 my-2 rounded-xl bg-surface overflow-hidden">
        @for (item of section2Items; track item.route; let last = $last) {
          <app-mobile-list-item
            [icon]="item.icon"
            [label]="item.label"
            [routerLink]="item.route"
            [last]="last"
          />
        }
      </div>

      <!-- Section 3 — Sécurité biométrique (native + supported only) -->
      @if (biometricSupported()) {
        <h2
          class="px-6 pt-6 pb-2 text-xs uppercase tracking-wider text-text-muted"
        >
          {{ 'ACCOUNT.SECTION_BIOMETRIC' | translate }}
        </h2>
        <div class="mx-4 my-2 rounded-xl bg-surface overflow-hidden">
          <div class="flex items-center px-4 py-3 gap-3">
            <ng-icon
              name="phosphorFingerprint"
              size="20"
              class="text-text-secondary"
            />
            <span class="flex-1 text-text-primary">
              {{ biometricLabel() }}
            </span>
            <ion-toggle
              [checked]="biometricEnabled()"
              (ionChange)="onBiometricToggle($event)"
              aria-label="Activer la connexion biométrique"
            />
          </div>
        </div>
      }

      <!-- Logout isolé en bas -->
      <button
        type="button"
        (click)="logout()"
        class="mx-4 mt-8 mb-6 w-[calc(100%-2rem)] rounded-xl bg-surface p-4 text-center font-medium text-red-600"
        style="border: none;"
      >
        {{ 'ACCOUNT.LOGOUT' | translate }}
      </button>
    </ion-content>

    <ion-footer class="ion-no-border">
      <app-navbar />
    </ion-footer>
  `,
})
export class AccountPage implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly biometric = inject(BiometricService);
  private readonly secureStorage = inject(SecureStorageService);

  readonly biometricSupported = signal(false);
  readonly biometricEnabled = signal(false);
  readonly biometricLabel = signal('Face ID / Touch ID');

  readonly section1Items: MenuItem[] = [
    {
      icon: 'phosphorPackage',
      label: 'ACCOUNT.MENU.ORDERS',
      route: '/dashboard/orders',
    },
    {
      icon: 'phosphorReceipt',
      label: 'ACCOUNT.MENU.SUBSCRIPTIONS',
      route: '/dashboard/subscriptions',
    },
    {
      icon: 'phosphorKey',
      label: 'ACCOUNT.MENU.LICENSES',
      route: '/dashboard/my-licenses',
    },
    {
      icon: 'phosphorMapPin',
      label: 'ACCOUNT.MENU.ADDRESSES',
      route: '/account/addresses',
    },
  ];

  readonly section2Items: MenuItem[] = [
    {
      icon: 'phosphorUser',
      label: 'ACCOUNT.MENU.PROFILE',
      route: '/dashboard/account',
    },
    {
      icon: 'phosphorShield',
      label: 'ACCOUNT.MENU.SECURITY',
      route: '/dashboard/account/security',
    },
    {
      icon: 'phosphorGear',
      label: 'ACCOUNT.MENU.PREFERENCES',
      route: '/dashboard/account/preferences',
    },
    {
      icon: 'phosphorCreditCard',
      label: 'ACCOUNT.MENU.BILLING',
      route: '/dashboard/account/billing',
    },
  ];

  async ngOnInit(): Promise<void> {
    const available = await this.biometric.isAvailable();
    this.biometricSupported.set(available);
    if (!available) return;
    const type = await this.biometric.getBiometryType();
    this.biometricLabel.set(
      type === 'faceId'
        ? 'Face ID'
        : type === 'touchId'
          ? 'Touch ID'
          : type === 'fingerprint'
            ? 'Empreinte'
            : 'Biométrie',
    );
    const enabled = await this.secureStorage.getItem('biometric_enabled');
    this.biometricEnabled.set(enabled === 'true');
  }

  async onBiometricToggle(event: Event): Promise<void> {
    const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
    this.biometricEnabled.set(checked);
    await this.secureStorage.setItem(
      'biometric_enabled',
      checked ? 'true' : 'false',
    );
    if (checked) {
      // Reset the "later" choice so future logins don't re-prompt unnecessarily.
      await this.secureStorage.setItem('biometric_prompt_dismissed', 'true');
    }
  }

  logout(): void {
    // AuthStore.logout() fire-and-forget; clearSession() inside redirects to /auth/login
    this.authStore.logout();
  }
}
