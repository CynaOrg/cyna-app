import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';

import { BiometryType } from '@aparajita/capacitor-biometric-auth';
import { AuthStore } from '@core/stores/auth.store';
import { LoginRequest } from '@core/interfaces/auth.interface';
import { PreferencesService } from '@core/services/preferences.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { BiometricService } from '../../../services/biometric.service';

const BIOMETRIC_OPT_IN_KEY = 'biometric_enabled';

/**
 * Native login page.
 *
 * Mirrors the web `LoginPage` markup/behaviour and adds:
 * - a "Sign in with Face ID / Touch ID" button shown when the device exposes
 *   biometry and the user has previously opted-in,
 * - an opt-in alert prompted right after a successful password login (only
 *   the first time and only when the device supports biometry).
 */
@Component({
  selector: 'app-login-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './login-native.page.html',
})
export class LoginNativePage implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly biometric = inject(BiometricService);
  private readonly preferences = inject(PreferencesService);
  private readonly alertCtrl = inject(AlertController);
  private readonly translate = inject(TranslateService);

  isLoading = false;
  errorMessage: string | null = null;
  showResendLink = false;
  lastEmail = '';
  private lastErrorCode: string | null = null;

  readonly showBiometricLogin = signal(false);
  readonly biometryLabel = signal<string>('Face ID');

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

    void this.refreshBiometricState();
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
    void this.refreshBiometricState();
  }

  /**
   * Re-evaluates whether the biometric quick-login button should be visible.
   * Visible only when: device supports biometry AND user has opted in.
   */
  private async refreshBiometricState(): Promise<void> {
    const available = await this.biometric.isAvailable();
    if (!available) {
      this.showBiometricLogin.set(false);
      return;
    }
    const optedIn = await this.preferences.get<boolean>(BIOMETRIC_OPT_IN_KEY);
    this.showBiometricLogin.set(!!optedIn);

    const type = await this.biometric.getBiometryType();
    this.biometryLabel.set(this.labelForBiometry(type));
  }

  private labelForBiometry(type: BiometryType): string {
    switch (type) {
      case BiometryType.faceId:
        return 'Face ID';
      case BiometryType.touchId:
      case BiometryType.fingerprintAuthentication:
        return 'Touch ID';
      default:
        return 'Biometric';
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
          void this.maybePromptBiometricOptIn().then(() => {
            this.authStore.navigateAfterLogin(returnUrl);
          });
        },
        error: (err) => {
          this.lastErrorCode = err.error?.error?.code || null;
        },
      }),
    );
  }

  /**
   * After a successful password login on a biometric-capable device, ask
   * the user once if they want to enable biometric quick-login. The choice
   * is persisted via Preferences so the alert never repeats.
   */
  private async maybePromptBiometricOptIn(): Promise<void> {
    const available = await this.biometric.isAvailable();
    if (!available) {
      return;
    }
    const existing = await this.preferences.get<boolean>(BIOMETRIC_OPT_IN_KEY);
    if (existing !== null) {
      // Either already enabled or user previously declined — never re-prompt.
      return;
    }

    const header = await firstValueFrom(
      this.translate.get('AUTH.LOGIN.BIOMETRIC_OPT_IN_TITLE'),
    );
    const message = await firstValueFrom(
      this.translate.get('AUTH.LOGIN.BIOMETRIC_OPT_IN_MESSAGE'),
    );
    const cancelText = await firstValueFrom(
      this.translate.get('AUTH.LOGIN.BIOMETRIC_OPT_IN_LATER'),
    );
    const confirmText = await firstValueFrom(
      this.translate.get('AUTH.LOGIN.BIOMETRIC_OPT_IN_ENABLE'),
    );

    const alert = await this.alertCtrl.create({
      header: header || 'Enable Face ID?',
      message:
        message ||
        'Activate Face ID to sign in faster next time without typing your password.',
      buttons: [
        {
          text: cancelText || 'Later',
          role: 'cancel',
          handler: () => {
            void this.preferences.set(BIOMETRIC_OPT_IN_KEY, false);
          },
        },
        {
          text: confirmText || 'Enable',
          handler: () => {
            void this.confirmBiometricOptIn();
          },
        },
      ],
    });
    await alert.present();
  }

  private async confirmBiometricOptIn(): Promise<void> {
    const reason = await firstValueFrom(
      this.translate.get('AUTH.LOGIN.BIOMETRIC_REASON'),
    );
    const ok = await this.biometric.authenticate(
      reason || 'Authenticate to enable biometric login',
    );
    await this.preferences.set(BIOMETRIC_OPT_IN_KEY, ok);
    if (ok) {
      this.showBiometricLogin.set(true);
    }
  }

  /**
   * Quick-login path: the user already opted-in. We prompt biometry and, on
   * success, attempt to restore the existing refresh-token-based session.
   */
  async onBiometricLogin(): Promise<void> {
    if (this.isLoading) {
      return;
    }
    const reason = await firstValueFrom(
      this.translate.get('AUTH.LOGIN.BIOMETRIC_REASON'),
    );
    const ok = await this.biometric.authenticate(
      reason || 'Authenticate to sign in',
    );
    if (!ok) {
      return;
    }
    const returnUrl =
      this.activatedRoute.snapshot.queryParamMap.get('returnUrl') ?? undefined;
    this.subscriptions.add(
      this.authStore.refreshToken().subscribe({
        next: () => {
          this.authStore.navigateAfterLogin(returnUrl);
        },
        error: () => {
          // Refresh token expired — clear opt-in so user logs in with
          // password again, and the next success will re-prompt opt-in.
          void this.preferences.remove(BIOMETRIC_OPT_IN_KEY);
          this.showBiometricLogin.set(false);
        },
      }),
    );
  }

  goToResendEmail(): void {
    this.router.navigate(['/m/auth/email-sent'], {
      queryParams: {
        type: 'register',
        email: this.lastEmail,
        cooldown: 0,
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/m/auth/register']);
  }
}
