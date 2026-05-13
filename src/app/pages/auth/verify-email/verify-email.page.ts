import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthStore } from '@core/stores/auth.store';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: 'verify-email.page.html',
  standalone: false,
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

  private readonly header = inject(MobileHeaderService);
  isNative = isNativeCapacitor();

  ionViewWillEnter(): void {
    if (this.isNative) this.header.configure({ showBack: true, visible: true });
    else this.header.hide();
  }
  isLoading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.errorMessage = this.translate.instant(
        'AUTH.VERIFY_EMAIL.TOKEN_MISSING',
      );
      return;
    }

    this.authStore.verifyEmail(token).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = this.translate.instant(
          'AUTH.VERIFY_EMAIL.SUCCESS_REDIRECT',
        );
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage =
          this.authStore.errorValue ||
          this.translate.instant('AUTH.VERIFY_EMAIL.ERROR_GENERIC');
      },
    });
  }
}
