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
  submitted = false;
  submittedEmail = '';

  private subscriptions = new Subscription();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
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
    this.submittedEmail = email!;
    const data: ForgotPasswordRequest = { email: email! };

    this.subscriptions.add(
      this.authStore.forgotPassword(data).subscribe({
        next: () => {
          this.submitted = true;
        },
        error: () => {
          // Always show success message for anti-enumeration
          this.submitted = true;
        },
      }),
    );
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
