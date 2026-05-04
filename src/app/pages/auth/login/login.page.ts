import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { AuthStore } from '@core/stores/auth.store';
import { LoginRequest } from '@core/interfaces/auth.interface';
import { BiometricAuthService, type BiometryKind } from '@core/native';

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
  private readonly biometric = inject(BiometricAuthService);
  private readonly alertCtrl = inject(AlertController);
  private readonly t = inject(TranslateService);

  isNative = isNativeCapacitor();
  isLoading = false;
  errorMessage: string | null = null;
  showResendLink = false;
  lastEmail = '';
  private lastErrorCode: string | null = null;

  /** Whether the dedicated "Sign in with Face ID" CTA must be shown. */
  readonly showBiometricLogin = signal(false);
  /** Detected biometry kind, used to pick the correct localized label. */
  readonly biometryKind = signal<BiometryKind>('none');

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
    void this.evaluateBiometricCta();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.authStore.clearError();
  }

  ionViewWillEnter(): void {
    this.form.reset({ email: '', password: '' });
    this.errorMessage = null;
    this.showResendLink = false;
    this.lastErrorCode = null;
  }

  /** Returns the localized label matching the detected biometry kind. */
  biometryLabel(): string {
    switch (this.biometryKind()) {
      case 'faceId':
        return this.t.instant('AUTH.BIOMETRIC.FACE_ID');
      case 'touchId':
        return this.t.instant('AUTH.BIOMETRIC.TOUCH_ID');
      case 'fingerprint':
        return this.t.instant('AUTH.BIOMETRIC.FINGERPRINT');
      default:
        return this.t.instant('AUTH.BIOMETRIC.FALLBACK');
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
        next: async () => {
          await this.maybePromptBiometricOptIn();
          this.authStore.navigateAfterLogin(returnUrl);
        },
        error: (err) => {
          this.lastErrorCode = err.error?.error?.code || null;
        },
      }),
    );
  }

  /**
   * Invoked from the dedicated biometric CTA on the login page. Prompts the
   * OS for biometric auth and, on success, restores the session via the
   * persisted refresh-token cookie.
   */
  async loginWithBiometric(): Promise<void> {
    const ok = await this.biometric.authenticate(
      this.t.instant('AUTH.LOGIN.BIOMETRIC_REASON'),
    );
    if (!ok) return;

    const restored = await this.authStore.loginWithBiometric();
    if (!restored) {
      // Refresh token expired or revoked — fall back to password form and
      // wipe the opt-in flag so the CTA disappears.
      await this.authStore.disableBiometric();
      this.showBiometricLogin.set(false);
      return;
    }
    const returnUrl =
      this.activatedRoute.snapshot.queryParamMap.get('returnUrl') ?? undefined;
    this.authStore.navigateAfterLogin(returnUrl);
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

  /**
   * Decides whether the dedicated biometric CTA must be rendered above the
   * password form. The CTA only appears when (1) the device supports
   * biometry, (2) the user has opted-in, and (3) we're inside a native shell.
   */
  private async evaluateBiometricCta(): Promise<void> {
    const [available, optedIn] = await Promise.all([
      this.biometric.isAvailable(),
      this.authStore.isBiometricEnabled(),
    ]);
    if (available) {
      this.biometryKind.set(await this.biometric.getBiometryType());
    }
    this.showBiometricLogin.set(available && optedIn);
  }

  /**
   * Right after a successful password login, ask the user (once) whether
   * they want to enable biometric authentication for future sign-ins. If
   * they accept, we trigger the OS prompt to gather permission and store
   * the opt-in flag in Capacitor Preferences.
   */
  private async maybePromptBiometricOptIn(): Promise<void> {
    const [available, optedIn] = await Promise.all([
      this.biometric.isAvailable(),
      this.authStore.isBiometricEnabled(),
    ]);
    if (!available || optedIn) {
      return;
    }
    const kind = await this.biometric.getBiometryType();
    this.biometryKind.set(kind);
    const label = this.biometryLabel();

    const alert = await this.alertCtrl.create({
      header: this.t.instant('AUTH.BIOMETRIC.OPT_IN_TITLE', { label }),
      message: this.t.instant('AUTH.BIOMETRIC.OPT_IN_MESSAGE', { label }),
      buttons: [
        {
          text: this.t.instant('AUTH.BIOMETRIC.OPT_IN_LATER'),
          role: 'cancel',
        },
        {
          text: this.t.instant('AUTH.BIOMETRIC.OPT_IN_ENABLE'),
          role: 'confirm',
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') {
      return;
    }
    const ok = await this.biometric.authenticate(
      this.t.instant('AUTH.LOGIN.BIOMETRIC_REASON'),
    );
    if (ok) {
      await this.authStore.enableBiometric();
      this.showBiometricLogin.set(true);
    }
  }
}
