import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AuthStore } from '@core/stores/auth.store';
import { RegisterRequest } from '@core/interfaces/auth.interface';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';

/**
 * Native register page. Mirrors the web `RegisterPage` markup and logic.
 */
@Component({
  selector: 'app-register-native',
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
  templateUrl: './register-native.page.html',
})
export class RegisterNativePage implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

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
    { validators: RegisterNativePage.passwordMatchValidator },
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

  ionViewWillEnter(): void {
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      vatNumber: '',
    });
    this.errorMessage = null;
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
          this.router.navigate(['/m/auth/email-sent'], {
            queryParams: { type: 'register', email: email },
          });
        },
      }),
    );
  }

  goToLogin(): void {
    this.router.navigate(['/m/auth/login']);
  }
}
