import { Component, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { BiometricService } from '@core/services/biometric.service';
import { SecureStorageService } from '@core/services/secure-storage.service';
import { AuthStore } from '@core/stores/auth.store';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  selector: 'app-splash',
  templateUrl: 'splash.page.html',
  standalone: false,
})
export class SplashPage implements OnInit {
  isFading = false;

  private readonly navController = inject(NavController);
  private readonly biometric = inject(BiometricService);
  private readonly secureStorage = inject(SecureStorageService);
  private readonly authStore = inject(AuthStore);
  private readonly header = inject(MobileHeaderService);

  ngOnInit() {
    this.header.hide();
    // Wait 1.5s, then start fade out
    setTimeout(() => {
      this.isFading = true;

      // After fade animation (500ms), decide where to go.
      setTimeout(() => {
        void this.routeAfterSplash();
      }, 500);
    }, 1500);
  }

  /**
   * Native-only Flow 2: if the user enabled biometric quick-login and a token
   * was persisted, prompt for biometry before letting them in.
   *
   * The biometric gate in AuthStore blocks `tryRestoreSession()` while
   * pending — so even though the refresh-token cookie may still be valid
   * server-side, the session is NOT restored locally until biometry passes.
   *
   *  - success → release the gate, restore the session, then /home
   *  - failure (cancel / no match / lockout) → /auth/login. The gate stays
   *    armed; the user must re-authenticate with password (which itself
   *    releases the gate via `AuthStore.login()`).
   *
   * On non-native platforms, the gate is never armed and we go straight to
   * /home, letting the auth guards handle redirection.
   */
  private async routeAfterSplash(): Promise<void> {
    if (!isNativeCapacitor()) {
      this.navController.navigateRoot('/home', { animated: false });
      return;
    }
    try {
      const enabled = await this.secureStorage.getItem('biometric_enabled');
      const token = await this.secureStorage.getItem('auth_token');
      if (enabled === 'true' && token) {
        const available = await this.biometric.isAvailable();
        if (available) {
          const result = await this.biometric.prompt(
            'Authentification requise pour accéder à Cyna',
          );
          if (!result.success) {
            // Gate stays pending → tryRestoreSession remains blocked.
            this.navController.navigateRoot('/auth/login', {
              animated: false,
            });
            return;
          }
          // Biometry passed: release the gate and trigger session restoration
          // now that the cookie can be safely exchanged.
          this.authStore.releaseBiometricGate();
          try {
            await firstValueFrom(this.authStore.tryRestoreSession());
          } catch {
            // Restoration failures fall through to /home, where auth guards
            // will redirect to /auth/login if the session cannot be rebuilt.
          }
        }
      }
    } catch {
      // Defensive: never trap the user on the splash on biometric errors.
    }
    this.navController.navigateRoot('/home', { animated: false });
  }
}
