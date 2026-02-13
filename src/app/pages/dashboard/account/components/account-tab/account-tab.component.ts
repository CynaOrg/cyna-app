import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent } from '@ng-icons/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { UserResponse } from '@core/interfaces/auth.interface';

@Component({
  selector: 'app-account-tab',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, TranslateModule, NgIconComponent, ButtonComponent],
  templateUrl: './account-tab.component.html',
})
export class AccountTabComponent {
  @Input() set user(value: UserResponse | null) {
    if (value) {
      this.currentUser = value;
      this.populateForm(value);
    }
  }
  @Input() error: string | null = null;

  @Output() profileSubmit = new EventEmitter<{
    firstName: string;
    lastName: string;
    companyName: string;
    vatNumber: string;
  }>();
  @Output() passwordSubmit = new EventEmitter<{
    currentPassword: string;
    newPassword: string;
  }>();

  currentUser: UserResponse | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;

  isEditMode = signal(false);
  profileLoading = signal(false);
  profileSuccess = signal(false);

  passwordLoading = signal(false);
  passwordSuccess = signal(false);
  passwordError = signal<string | null>(null);

  private readonly passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(private fb: FormBuilder) {
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

  private populateForm(user: UserResponse): void {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      vatNumber: user.vatNumber || '',
    });
  }

  enterEditMode(): void {
    this.isEditMode.set(true);
  }

  exitEditMode(): void {
    this.isEditMode.set(false);
    if (this.currentUser) {
      this.populateForm(this.currentUser);
    }
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) return;

    this.profileSuccess.set(false);
    this.profileLoading.set(true);

    this.profileSubmit.emit(this.profileForm.value);
  }

  onProfileSuccess(): void {
    this.profileSuccess.set(true);
    this.profileLoading.set(false);
    this.isEditMode.set(false);
    setTimeout(() => this.profileSuccess.set(false), 3000);
  }

  onProfileError(): void {
    this.profileLoading.set(false);
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.passwordSuccess.set(false);
    this.passwordError.set(null);
    this.passwordLoading.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.passwordSubmit.emit({ currentPassword, newPassword });
  }

  onPasswordSuccess(): void {
    this.passwordSuccess.set(true);
    this.passwordForm.reset();
    this.passwordLoading.set(false);
  }

  onPasswordError(error: string): void {
    this.passwordError.set(error);
    this.passwordLoading.set(false);
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) return 'PROFILE.VALIDATION.REQUIRED';
    if (control.errors['maxlength']) return 'PROFILE.VALIDATION.MAX_LENGTH';

    return '';
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