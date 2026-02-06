import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { AuthStore } from '@core/stores/auth.store';

@Component({
  selector: 'app-verify-email',
  templateUrl: 'verify-email.page.html',
  standalone: false,
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  isNative = isNativeCapacitor();
  isLoading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.errorMessage = 'Token de verification manquant.';
      return;
    }

    this.authStore.verifyEmail(token).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'Votre email a ete verifie avec succes. Redirection vers la connexion...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage =
          this.authStore.errorValue || 'Erreur lors de la verification.';
      },
    });
  }
}
