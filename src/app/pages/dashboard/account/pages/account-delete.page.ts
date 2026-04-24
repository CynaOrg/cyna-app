import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { AuthStore } from '@core/stores/auth.store';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-account-delete',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    NgIconComponent,
    RouterLink,
    ButtonComponent,
  ],
  providers: [provideIcons({ phosphorArrowLeft })],
  templateUrl: './account-delete.page.html',
})
export class AccountDeletePage {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  form: FormGroup = this.fb.group({
    password: ['', [Validators.required]],
    acknowledged: [false, [Validators.requiredTrue]],
  });

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  get canSubmit(): boolean {
    return this.form.valid && !this.submitting();
  }

  cancel(): void {
    this.router.navigate(['/dashboard/account/security']);
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.authStore
      .deleteAccount({ password: this.form.value.password })
      .subscribe({
        next: () => {
          this.authStore.clearSession();
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.submitting.set(false);
          const status = (err as { status?: number })?.status;
          const key =
            status === 401 || status === 403
              ? 'DELETE_ACCOUNT_PAGE.ERROR_WRONG_PASSWORD'
              : 'DELETE_ACCOUNT_PAGE.ERROR_SERVICE_UNAVAILABLE';
          this.errorMessage.set(key);
        },
      });
  }
}
