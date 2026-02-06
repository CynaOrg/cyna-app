import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { AuthStore } from '@core/stores/auth.store';
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

  isNative = isNativeCapacitor();
  isLoading = false;
  errorMessage: string | null = null;

  private subscriptions = new Subscription();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  ngOnInit(): void {
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

    const { email, password } = this.form.getRawValue();
    const credentials: LoginRequest = {
      email: email!,
      password: password!,
    };

    this.subscriptions.add(
      this.authStore.login(credentials).subscribe({
        next: () => {
          this.authStore.navigateAfterLogin();
        },
      }),
    );
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
