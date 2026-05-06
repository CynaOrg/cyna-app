import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorFingerprint } from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { SecurityTabComponent } from '../../dashboard/account/components/security-tab/security-tab.component';
import { AuthStore } from '@core/stores/auth.store';
import { BiometricService } from '@core/services/biometric.service';
import { SecureStorageService } from '@core/services/secure-storage.service';

/**
 * Native-only Security sub-page reachable from the bottom-tab Account screen.
 * Hosts both the change-password form (reused from web) and the biometric
 * toggle (relocated from /account so the Account home stays a clean menu).
 */
@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NgIconComponent,
    MobilePageShellComponent,
    SecurityTabComponent,
  ],
  viewProviders: [provideIcons({ phosphorFingerprint })],
  template: `
    <app-mobile-page-shell [showBack]="true" title="ACCOUNT.MENU.SECURITY">
      <div class="px-4 py-4">
        <app-security-tab (passwordSubmit)="onPasswordSubmit($event)" />
      </div>

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
    </app-mobile-page-shell>
  `,
})
export class AccountSecurityPage implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly biometric = inject(BiometricService);
  private readonly secureStorage = inject(SecureStorageService);

  readonly biometricSupported = signal(false);
  readonly biometricEnabled = signal(false);
  readonly biometricLabel = signal('Face ID / Touch ID');

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
      await this.secureStorage.setItem('biometric_prompt_dismissed', 'true');
    }
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
}
