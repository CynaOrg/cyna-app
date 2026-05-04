import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AuthStore } from '@core/stores/auth.store';
import { ForgotPasswordRequest } from '@core/interfaces/auth.interface';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';

/**
 * Native forgot-password page. Mirrors the web `ForgotPasswordPage`.
 */
@Component({
  selector: 'app-forgot-password-native',
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
  templateUrl: './forgot-password-native.page.html',
})
export class ForgotPasswordNativePage implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

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

  ionViewWillEnter(): void {
    this.form.reset({ email: '' });
    this.errorMessage = null;
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
          this.router.navigate(['/m/auth/email-sent'], {
            queryParams: { type: 'forgot-password', email: email },
          });
        },
        error: () => {
          // Anti-enumeration: always navigate to confirmation screen.
          this.router.navigate(['/m/auth/email-sent'], {
            queryParams: { type: 'forgot-password', email: email },
          });
        },
      }),
    );
  }

  goToLogin(): void {
    this.router.navigate(['/m/auth/login']);
  }
}
