import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EditableSectionComponent } from '../../shared/editable-section.component';
import { DisplayRowComponent } from '../../shared/display-row.component';
import { PrivacyService } from '@core/services/privacy.service';

export interface PasswordSubmitEvent {
  data: {
    currentPassword: string;
    newPassword: string;
  };
  onSuccess: () => void;
  onError: (message: string) => void;
}

@Component({
  selector: 'app-security-tab',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    EditableSectionComponent,
    DisplayRowComponent,
  ],
  templateUrl: './security-tab.component.html',
})
export class SecurityTabComponent {
  @Output() passwordSubmit = new EventEmitter<PasswordSubmitEvent>();

  private readonly fb = inject(FormBuilder);
  private readonly privacyService = inject(PrivacyService);
  private readonly toast = inject(ToastController);
  private readonly translate = inject(TranslateService);

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: SecurityTabComponent.passwordMatchValidator },
  );

  passwordSaving = signal(false);
  passwordError = signal<string | null>(null);
  exportLoading = signal(false);

  newPasswordValue = signal('');

  constructor() {
    this.passwordForm
      .get('newPassword')!
      .valueChanges.subscribe((v: string) =>
        this.newPasswordValue.set(v ?? ''),
      );
  }

  rules = computed(() => {
    const v = this.newPasswordValue();
    return {
      length: v.length >= 8,
      uppercase: /[A-Z]/.test(v),
      lowercase: /[a-z]/.test(v),
      digit: /\d/.test(v),
      special: /[@$!%*?&]/.test(v),
    };
  });

  allRulesPassing = computed(() => {
    const r = this.rules();
    return r.length && r.uppercase && r.lowercase && r.digit && r.special;
  });

  canSavePassword = computed(() => {
    return (
      this.passwordForm.get('currentPassword')!.valid &&
      this.allRulesPassing() &&
      !this.passwordForm.errors?.['passwordMismatch'] &&
      !!this.passwordForm.get('confirmPassword')!.value
    );
  });

  submitPassword(): void {
    if (!this.canSavePassword()) return;
    this.passwordSaving.set(true);
    this.passwordError.set(null);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.passwordSubmit.emit({
      data: { currentPassword, newPassword },
      onSuccess: () => {
        this.passwordSaving.set(false);
        this.passwordForm.reset();
      },
      onError: (message: string) => {
        this.passwordSaving.set(false);
        this.passwordError.set(message);
      },
    });
  }

  ruleActive(key: string): boolean {
    return this.rules()[key as keyof ReturnType<typeof this.rules>];
  }

  cancelPassword(): void {
    this.passwordForm.reset();
    this.passwordError.set(null);
    this.passwordSaving.set(false);
  }

  requestDataExport(): void {
    this.exportLoading.set(true);
    this.privacyService.requestDataExport().subscribe(async (result) => {
      this.exportLoading.set(false);
      const message =
        result.status === 'unavailable'
          ? this.translate.instant('SECURITY.DATA_EXPORT.NOT_AVAILABLE')
          : this.translate.instant('SECURITY.DATA_EXPORT.PENDING');
      const toast = await this.toast.create({ message, duration: 3000 });
      await toast.present();
    });
  }

  private static passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
