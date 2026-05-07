import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Keyboard } from '@capacitor/keyboard';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';
import { MobileHeaderService } from '@core/services/mobile-header.service';
import { SecureStorageService } from '@core/services/secure-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  protected readonly header = inject(MobileHeaderService);
  private readonly secureStorage = inject(SecureStorageService);

  readonly isNative = isNativeCapacitor();

  protected readonly keyboardOpen = signal(false);

  onMobileHeaderActionClick(): void {
    this.header.emitActionClick();
  }

  isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  isDashboardRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/dashboard')),
    ),
    { initialValue: false },
  );

  showMobileNavbar = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => {
        const url = e.urlAfterRedirects;
        return !url.startsWith('/splash');
      }),
    ),
    { initialValue: !this.router.url.startsWith('/splash') },
  );

  ngOnInit(): void {
    this.cartStore.loadCart();

    if (this.isNative) {
      Keyboard.addListener('keyboardWillShow', () =>
        this.keyboardOpen.set(true),
      );
      Keyboard.addListener('keyboardWillHide', () =>
        this.keyboardOpen.set(false),
      );
      void this.healOrphanBiometricOptIn();
    }
  }

  /**
   * Self-heal: if `biometric_enabled='true'` was persisted but no `auth_token`
   * is present, it means the user previously opted in but their session was
   * cleared (logout, expired token, or buggy older app version that set the
   * flag without enrolling). Wipe the flags so the next login restarts the
   * enrollment dialog cleanly.
   */
  private async healOrphanBiometricOptIn(): Promise<void> {
    try {
      const enabled = await this.secureStorage.getItem('biometric_enabled');
      if (enabled !== 'true') return;
      const token = await this.secureStorage.getItem('auth_token');
      if (token) return;
      await this.secureStorage.removeItem('biometric_enabled');
      await this.secureStorage.removeItem('biometric_prompt_dismissed');
    } catch {
      // ignore: best-effort cleanup
    }
  }
}
