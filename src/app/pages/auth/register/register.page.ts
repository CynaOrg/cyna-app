import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { AuthStore } from '@core/stores/auth.store';
import { RegisterRequest } from '@core/interfaces/auth.interface';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  standalone: false,
})
export class RegisterPage implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isNative = isNativeCapacitor();
  isLoading = false;
  errorMessage: string | null = null;

  private subscriptions = new Subscription();

  form = this.fb.group(
    {
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          ),
        ],
      ],
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
      companyName: [''],
      vatNumber: [''],
    },
    { validators: RegisterPage.passwordMatchValidator },
  );

  static passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Clear the mismatch error when passwords match again
    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

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
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.authStore.clearError();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      return;
    }

    const { email, password, firstName, lastName, companyName, vatNumber } =
      this.form.getRawValue();
    const data: RegisterRequest = {
      email: email!,
      password: password!,
      firstName: firstName!,
      lastName: lastName!,
      ...(companyName ? { companyName } : {}),
      ...(vatNumber ? { vatNumber } : {}),
    };

    this.subscriptions.add(
      this.authStore.register(data).subscribe({
        next: () => {
          this.router.navigate(['/auth/email-sent'], {
            queryParams: { type: 'register', email: email },
          });
        },
      }),
    );
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
