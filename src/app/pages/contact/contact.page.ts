import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

interface ContactResponse {
  data: {
    messageId: string;
    message: string;
  };
}

@Component({
  selector: 'app-contact',
  templateUrl: 'contact.page.html',
  standalone: false,
})
export class ContactPage implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly apiUrl = `${environment.apiUrl}/content/contact`;

  isNative = isNativeCapacitor();
  isLoading = false;
  isSent = false;
  errorMessage: string | null = null;

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
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

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
            this.isLoading = false;
            this.isSent = true;
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = this.translate.instant('CONTACT.ERROR_GENERIC');
          },
        }),
    );
  }

  resetForm(): void {
    this.form.reset();
    this.isSent = false;
    this.errorMessage = null;
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || control.valid) return '';

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
    if (control.hasError('pattern'))
      return this.translate.instant('CONTACT.VALIDATION.EMAIL_INVALID');
    if (control.hasError('minlength'))
      return this.translate.instant('CONTACT.VALIDATION.MESSAGE_MIN_LENGTH');
    if (control.hasError('maxlength'))
      return this.translate.instant('CONTACT.VALIDATION.FIELD_TOO_LONG');
    return '';
  }
}
