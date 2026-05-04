import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { environment } from '../../../../environments/environment';
import { NativePageHeaderComponent } from '../../components/native-page-header.component';
import { HapticOnDirective } from '../../directives/haptic-on.directive';

interface ContactResponse {
  data: {
    messageId: string;
    message: string;
  };
}

/**
 * Native contact page mounted at `/m/contact`.
 *
 * Mirrors the web `ContactPage` form (name + email + subject + message,
 * same validators) but rendered with the native page header + safe-area
 * scroll layout. Submission posts to `/content/contact` exactly like web.
 */
@Component({
  selector: 'app-contact-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    ButtonComponent,
    NativePageHeaderComponent,
    HapticOnDirective,
  ],
  templateUrl: './contact-native.page.html',
})
export class ContactNativePage implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly apiUrl = `${environment.apiUrl}/content/contact`;

  readonly isLoading = signal(false);
  readonly isSent = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private subscriptions = new Subscription();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        Validators.maxLength(255),
      ],
    ],
    subject: ['', [Validators.required, Validators.maxLength(300)]],
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(5000),
      ],
    ],
  });

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, email, subject, message } = this.form.getRawValue();

    this.subscriptions.add(
      this.http
        .post<ContactResponse>(this.apiUrl, {
          name: name!.trim(),
          email: email!.toLowerCase().trim(),
          subject: subject!.trim(),
          message: message!.trim(),
        })
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.isSent.set(true);
          },
          error: () => {
            this.isLoading.set(false);
            this.errorMessage.set(
              this.translate.instant('CONTACT.ERROR_GENERIC'),
            );
          },
        }),
    );
  }

  resetForm(): void {
    this.form.reset();
    this.isSent.set(false);
    this.errorMessage.set(null);
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || control.valid) {
      return '';
    }

    if (control.hasError('required')) {
      const keyMap: Record<string, string> = {
        name: 'CONTACT.VALIDATION.NAME_REQUIRED',
        email: 'CONTACT.VALIDATION.EMAIL_REQUIRED',
        subject: 'CONTACT.VALIDATION.SUBJECT_REQUIRED',
        message: 'CONTACT.VALIDATION.MESSAGE_REQUIRED',
      };
      return this.translate.instant(
        keyMap[field] || 'CONTACT.VALIDATION.FIELD_REQUIRED',
      );
    }
    if (control.hasError('pattern')) {
      return this.translate.instant('CONTACT.VALIDATION.EMAIL_INVALID');
    }
    if (control.hasError('minlength')) {
      return this.translate.instant('CONTACT.VALIDATION.MESSAGE_MIN_LENGTH');
    }
    if (control.hasError('maxlength')) {
      return this.translate.instant('CONTACT.VALIDATION.FIELD_TOO_LONG');
    }
    return '';
  }
}
