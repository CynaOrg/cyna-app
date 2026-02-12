import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthStore } from '@core/stores/auth.store';
import { UserResponse } from '@core/interfaces/auth.interface';

@Component({
  selector: 'app-dashboard-account',
  templateUrl: './dashboard-account.page.html',
  standalone: false,
})
export class DashboardAccountPage implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  user$ = this.authStore.user$;
  isLoading$ = this.authStore.isLoading$;
  error$ = this.authStore.error$;

  profileForm: FormGroup;
  isProfileExpanded = signal(true);
  profileSuccess = signal(false);

  passwordForm: FormGroup;
  isSecurityExpanded = signal(false);
  passwordSuccess = signal(false);
  passwordError = signal<string | null>(null);

  private readonly passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      companyName: ['', [Validators.maxLength(255)]],
      vatNumber: ['', [Validators.maxLength(50)]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [Validators.required, Validators.pattern(this.passwordPattern)],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.authStore.getProfile().subscribe({
      next: (user) => this.populateForm(user),
    });
  }

  private populateForm(user: UserResponse): void {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      vatNumber: user.vatNumber || '',
    });
  }

  toggleProfileSection(): void {
    this.isProfileExpanded.update((v) => !v);
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) return;

    this.profileSuccess.set(false);
    this.authStore.clearError();

    this.authStore.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.profileSuccess.set(true);
        setTimeout(() => this.profileSuccess.set(false), 3000);
      },
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) return 'PROFILE.VALIDATION.REQUIRED';
    if (control.errors['maxlength']) return 'PROFILE.VALIDATION.MAX_LENGTH';

    return '';
  }

  toggleSecuritySection(): void {
    this.isSecurityExpanded.update((v) => !v);
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.passwordSuccess.set(false);
    this.passwordError.set(null);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authStore.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
        setTimeout(() => {
          this.passwordSuccess.set(false);
          this.authStore.logout();
        }, 2000);
      },
      error: () => {
        this.passwordError.set(this.authStore.errorValue);
      },
    });
  }

  getPasswordFieldError(fieldName: string): string {
    const control = this.passwordForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) return 'PROFILE.VALIDATION.REQUIRED';
    if (control.errors['pattern'])
      return 'PROFILE.SECURITY.PASSWORD_REQUIREMENTS';

    return '';
  }

  get passwordMismatchError(): boolean {
    return (
      this.passwordForm.errors?.['passwordMismatch'] &&
      this.passwordForm.get('confirmPassword')?.touched
    );
  }
}
