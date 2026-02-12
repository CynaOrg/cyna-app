import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      companyName: ['', [Validators.maxLength(255)]],
      vatNumber: ['', [Validators.maxLength(50)]],
    });
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
}
