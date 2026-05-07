import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  selector: 'app-email-sent',
  templateUrl: 'email-sent.page.html',
  standalone: false,
})
export class EmailSentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  private readonly header = inject(MobileHeaderService);
  isNative = isNativeCapacitor();

  ionViewWillEnter(): void {
    if (this.isNative) this.header.configure({ showBack: true, visible: true });
    else this.header.hide();
  }
  type: 'register' | 'forgot-password' = 'register';
  email = '';
  initialCooldown = 60;

  get title(): string {
    return this.type === 'register'
      ? this.translate.instant('AUTH.EMAIL_SENT.REGISTER_TITLE')
      : this.translate.instant('AUTH.EMAIL_SENT.FORGOT_TITLE');
  }

  get message(): string {
    if (this.type === 'register') {
      return this.translate.instant('AUTH.EMAIL_SENT.REGISTER_MESSAGE', {
        email: this.email,
      });
    }
    return this.translate.instant('AUTH.EMAIL_SENT.FORGOT_MESSAGE', {
      email: this.email,
    });
  }

  get resendLabel(): string {
    return this.type === 'register'
      ? this.translate.instant('AUTH.EMAIL_SENT.RESEND_VERIFICATION')
      : this.translate.instant('AUTH.EMAIL_SENT.RESEND_LINK');
  }

  get resendMode(): 'verification' | 'forgot-password' {
    return this.type === 'register' ? 'verification' : 'forgot-password';
  }

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!email) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.email = email;
    if (type === 'forgot-password') {
      this.type = 'forgot-password';
    }

    const cooldown = this.route.snapshot.queryParamMap.get('cooldown');
    if (cooldown !== null) {
      this.initialCooldown = parseInt(cooldown, 10) || 0;
    }
  }
}
