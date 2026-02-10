import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { AuthStore } from '@core/stores/auth.store';
import { ForgotPasswordRequest } from '@core/interfaces/auth.interface';

@Component({
  selector: 'app-forgot-password',
  templateUrl: 'forgot-password.page.html',
  standalone: false,
})
export class ForgotPasswordPage implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isNative = isNativeCapacitor();
  isLoading = false;
  errorMessage: string | null = null;

  private subscriptions = new Subscription();

  form = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    ],
  });

  ngOnInit(): void {
    this.subscriptions.add(
      this.authStore.isLoading$.subscribe((loading) => {
        this.isLoading = loading;
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

    const { email } = this.form.getRawValue();
    const data: ForgotPasswordRequest = { email: email! };

    this.subscriptions.add(
      this.authStore.forgotPassword(data).subscribe({
        next: () => {
          this.router.navigate(['/auth/email-sent'], {
            queryParams: { type: 'forgot-password', email: email },
          });
        },
        error: () => {
          // Always show success for anti-enumeration
          this.router.navigate(['/auth/email-sent'], {
            queryParams: { type: 'forgot-password', email: email },
          });
        },
      }),
    );
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
