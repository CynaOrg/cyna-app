import { Component, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { BiometricService } from '@core/services/biometric.service';
import { SecureStorageService } from '@core/services/secure-storage.service';

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

  ngOnInit() {
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
   *  - success → /home (cookie-based session restoration takes over)
   *  - failure (cancel / no match / lockout) → /auth/login as a safe fallback
   * Otherwise, default to /home and let the auth guards handle redirection.
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
            this.navController.navigateRoot('/auth/login', {
              animated: false,
            });
            return;
          }
        }
      }
    } catch {
      // Defensive: never trap the user on the splash on biometric errors.
    }
    this.navController.navigateRoot('/home', { animated: false });
  }
}
