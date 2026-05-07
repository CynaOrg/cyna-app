import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
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

  private readonly header = inject(MobileHeaderService);
  isNative = isNativeCapacitor();
  isLoading = false;
  errorMessage: string | null = null;
  showResendLink = false;
  lastEmail = '';
  private lastErrorCode: string | null = null;

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
        type === 'faceId'
          ? 'Face ID'
          : type === 'touchId'
            ? 'Touch ID'
            : 'la biométrie';
      const alert = await this.alertController.create({
        header: `Activer ${typeLabel} ?`,
        message:
          'Connectez-vous plus rapidement à vos prochaines visites de Cyna.',
        buttons: [
          {
            text: 'Plus tard',
            role: 'cancel',
            handler: () => {
              void this.secureStorage.setItem(
                'biometric_prompt_dismissed',
                'true',
              );
            },
          },
          {
            text: 'Activer',
            handler: () => {
              void this.secureStorage.setItem('biometric_enabled', 'true');
            },
          },
        ],
      });
      await alert.present();
    } catch {
      // Never let the biometric prompt fail the login flow.
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
