import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobileHeaderService } from '@core/services/mobile-header.service';
import { AuthStore } from '@core/stores/auth.store';
import { BiometricService } from '@core/services/biometric.service';
import { SecureStorageService } from '@core/services/secure-storage.service';
import { LoginRequest } from '@core/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  standalone: false,
})
export class LoginPage implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly biometric = inject(BiometricService);
  private readonly secureStorage = inject(SecureStorageService);
  private readonly alertController = inject(AlertController);
  private readonly location = inject(Location);
  private readonly translate = inject(TranslateService);

  private translateBiometricType(
    type: 'faceId' | 'touchId' | 'fingerprint' | string,
  ): string {
    if (type === 'faceId')
      return this.translate.instant('AUTH.BIOMETRIC.TYPE_FACE_ID');
    if (type === 'touchId')
      return this.translate.instant('AUTH.BIOMETRIC.TYPE_TOUCH_ID');
    if (type === 'fingerprint')
      return this.translate.instant('AUTH.BIOMETRIC.TYPE_FINGERPRINT');
    return this.translate.instant('AUTH.BIOMETRIC.TYPE_GENERIC');
  }

  private readonly header = inject(MobileHeaderService);
  isNative = isNativeCapacitor();
  isLoading = false;
  errorMessage: string | null = null;
  showResendLink = false;
  lastEmail = '';
  private lastErrorCode: string | null = null;

  readonly biometricQuickLoginAvailable = signal(false);
  readonly biometricLabel = signal<string>(
    this.translate.instant('AUTH.BIOMETRIC.TYPE_FACE_ID'),
  );

  private subscriptions = new Subscription();

  form = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.authStore.clearError();
    this.subscriptions.add(
      this.authStore.isLoading$.subscribe((loading) => {
        this.isLoading = loading;
      }),
    );
    this.subscriptions.add(
      this.authStore.error$.subscribe((error) => {
        this.errorMessage = error;
        this.showResendLink = this.lastErrorCode === 'EMAIL_NOT_VERIFIED';
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.authStore.clearError();
  }

  ionViewWillEnter(): void {
    this.header.hide();
    this.form.reset({ email: '', password: '' });
    this.errorMessage = null;
    this.showResendLink = false;
    this.lastErrorCode = null;
    void this.refreshBiometricQuickLogin();
  }

  /**
   * Show the biometric quick-login button only when:
   *  - we're native,
   *  - the user previously opted in (`biometric_enabled`),
   *  - a refresh token is present in the Keychain (so we have something to
   *    exchange for a fresh session),
   *  - the device's biometry is currently available.
   *
   * The check is on `refresh_token`, not `auth_token`, because the explicit
   * logout flow wipes the access token but keeps the refresh token so the
   * user can re-login via Face ID.
   */
  private async refreshBiometricQuickLogin(): Promise<void> {
    if (!this.isNative) {
      this.biometricQuickLoginAvailable.set(false);
      return;
    }
    try {
      const enabled = await this.secureStorage.getItem('biometric_enabled');
      if (enabled !== 'true') {
        this.biometricQuickLoginAvailable.set(false);
        return;
      }
      const refresh = await this.secureStorage.getItem('refresh_token');
      if (!refresh) {
        this.biometricQuickLoginAvailable.set(false);
        return;
      }
      const available = await this.biometric.isAvailable();
      this.biometricQuickLoginAvailable.set(available);
      if (!available) return;
      const type = await this.biometric.getBiometryType();
      this.biometricLabel.set(this.translateBiometricType(type));
    } catch {
      this.biometricQuickLoginAvailable.set(false);
    }
  }

  async loginWithBiometric(): Promise<void> {
    if (this.isLoading) return;
    const result = await this.biometric.prompt(
      this.translate.instant('AUTH.BIOMETRIC.PROMPT_AUTH'),
    );
    if (!result.success) return;
    // Release the gate so subsequent guards can call tryRestoreSession; here
    // we use refreshToken() directly because it propagates errors instead of
    // silently resolving (tryRestoreSession swallows them by design).
    this.authStore.releaseBiometricGate();
    try {
      await firstValueFrom(this.authStore.refreshToken());
      const returnUrl =
        this.activatedRoute.snapshot.queryParamMap.get('returnUrl') ??
        undefined;
      this.authStore.navigateAfterLogin(returnUrl);
    } catch {
      // refreshToken() already cleared the session (token wiped, redirect to
      // /auth/login). We're already on /auth/login so the redirect is a no-op,
      // but we still purge the local marker so the button hides.
      this.biometricQuickLoginAvailable.set(false);
      this.errorMessage = this.translate.instant(
        'AUTH.BIOMETRIC.SESSION_EXPIRED',
      );
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.lastEmail = email!;
    const credentials: LoginRequest = {
      email: email!,
      password: password!,
    };

    this.lastErrorCode = null;
    const returnUrl =
      this.activatedRoute.snapshot.queryParamMap.get('returnUrl') ?? undefined;
    this.subscriptions.add(
      this.authStore.login(credentials).subscribe({
        next: () => {
          void this.maybePromptBiometricEnrollment();
          this.authStore.navigateAfterLogin(returnUrl);
        },
        error: (err) => {
          this.lastErrorCode = err.error?.error?.code || null;
        },
      }),
    );
  }

  /**
   * After a successful login on native, ask the user once whether they want to
   * enable biometric quick-login for the next launches. The choice is sticky:
   * - 'biometric_enabled' = 'true' if accepted (Flow 2 will trigger).
   * - 'biometric_prompt_dismissed' = 'true' if the user picked "Plus tard".
   */
  private async maybePromptBiometricEnrollment(): Promise<void> {
    if (!this.isNative) return;
    try {
      const enabled = await this.secureStorage.getItem('biometric_enabled');
      if (enabled === 'true') return;
      const dismissed = await this.secureStorage.getItem(
        'biometric_prompt_dismissed',
      );
      if (dismissed === 'true') return;
      const available = await this.biometric.isAvailable();
      if (!available) return;
      const type = await this.biometric.getBiometryType();
      const typeLabel =
        type === 'faceId' || type === 'touchId'
          ? this.translateBiometricType(type)
          : this.translate.instant('AUTH.BIOMETRIC.TYPE_GENERIC_LOWER');
      const alert = await this.alertController.create({
        header: this.translate.instant('AUTH.BIOMETRIC.ACTIVATE_TITLE', {
          type: typeLabel,
        }),
        message: this.translate.instant('AUTH.BIOMETRIC.ACTIVATE_MESSAGE'),
        buttons: [
          {
            text: this.translate.instant('AUTH.BIOMETRIC.LATER'),
            role: 'cancel',
            handler: () => {
              void this.secureStorage.setItem(
                'biometric_prompt_dismissed',
                'true',
              );
            },
          },
          {
            text: this.translate.instant('AUTH.BIOMETRIC.ACTIVATE'),
            handler: () => {
              void this.enrollBiometric(typeLabel);
            },
          },
        ],
      });
      await alert.present();
    } catch {
      // Never let the biometric prompt fail the login flow.
    }
  }

  /**
   * Verify the device's biometric works before persisting the opt-in. Without
   * this check we'd silently set `biometric_enabled='true'` even on devices
   * where the user cancels the system prompt — leaving them locked out at
   * next launch since the splash gate would refuse to restore the session.
   */
  private async enrollBiometric(typeLabel: string): Promise<void> {
    const result = await this.biometric.prompt(
      this.translate.instant('AUTH.BIOMETRIC.CONFIRM_ENROLL', {
        type: typeLabel,
      }),
    );
    if (result.success) {
      await this.secureStorage.setItem('biometric_enabled', 'true');
    } else {
      await this.secureStorage.setItem('biometric_prompt_dismissed', 'true');
    }
  }

  goToResendEmail(): void {
    this.router.navigate(['/auth/email-sent'], {
      queryParams: {
        type: 'register',
        email: this.lastEmail,
        cooldown: 0,
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goBack(): void {
    this.location.back();
  }
}
