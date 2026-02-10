import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { environment } from '../../../environments/environment';

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
            this.errorMessage = 'Une erreur est survenue. Veuillez reessayer.';
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
      const labels: Record<string, string> = {
        name: 'Le nom est obligatoire',
        email: "L'adresse e-mail est obligatoire",
        subject: 'Le sujet est obligatoire',
        message: 'Le message est obligatoire',
      };
      return labels[field] || 'Ce champ est obligatoire';
    }
    if (control.hasError('pattern')) return "L'adresse e-mail est invalide";
    if (control.hasError('minlength'))
      return 'Le message doit contenir au moins 10 caracteres';
    if (control.hasError('maxlength')) return 'Ce champ est trop long';
    return '';
  }
}
