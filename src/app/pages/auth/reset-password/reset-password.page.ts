import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { AuthStore } from '@core/stores/auth.store';
import { ResetPasswordRequest } from '@core/interfaces/auth.interface';

@Component({
  selector: 'app-reset-password',
  templateUrl: 'reset-password.page.html',
  standalone: false,
})
export class ResetPasswordPage implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isNative = isNativeCapacitor();
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  token: string | null = null;

  private subscriptions = new Subscription();

  form = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: ResetPasswordPage.passwordMatchValidator },
  );

  static passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.errorMessage =
        'Lien de reinitialisation invalide. Veuillez refaire une demande.';
    }

    this.subscriptions.add(
      this.authStore.isLoading$.subscribe((loading) => {
        this.isLoading = loading;
      }),
    );
    this.subscriptions.add(
      this.authStore.error$.subscribe((error) => {
        if (error) {
          this.errorMessage = error;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.authStore.clearError();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading || !this.token) {
      return;
    }

    const { password } = this.form.getRawValue();
    const data: ResetPasswordRequest = {
      token: this.token,
      newPassword: password!,
    };

    this.subscriptions.add(
      this.authStore.resetPassword(data).subscribe({
        next: () => {
          this.successMessage =
            'Mot de passe reinitialise avec succes. Redirection vers la connexion...';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
      }),
    );
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
