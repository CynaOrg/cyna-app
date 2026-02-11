import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval, take, map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/stores/auth.store';

@Component({
  selector: 'app-resend-email',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    @if (sent) {
      <p class="text-xs text-success">
        {{ 'AUTH.RESEND_EMAIL.SENT' | translate }}
      </p>
    } @else if (cooldown > 0) {
      <p class="text-xs text-text-muted">
        {{ 'AUTH.RESEND_EMAIL.COOLDOWN' | translate: { seconds: cooldown } }}
      </p>
    } @else {
      <a
        class="cursor-pointer text-xs font-medium text-primary hover:text-primary-hover"
        (click)="resend()"
      >
        {{ label }}
      </a>
    }
  `,
})
export class ResendEmailComponent implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);

  @Input({ required: true }) email!: string;
  @Input() label = '';
  @Input() initialCooldown = 0;
  @Input() mode: 'verification' | 'forgot-password' = 'verification';

  cooldown = 0;
  sent = false;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    if (this.initialCooldown > 0) {
      this.startCooldown(this.initialCooldown);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  resend(): void {
    if (this.cooldown > 0) return;

    const request$ =
      this.mode === 'forgot-password'
        ? this.authStore.forgotPassword({ email: this.email })
        : this.authStore.resendVerification(this.email);

    this.subscriptions.add(
      request$.subscribe({
        next: () => {
          this.sent = true;
          setTimeout(() => {
            this.sent = false;
            this.startCooldown(60);
          }, 3000);
        },
        error: () => {
          if (this.mode === 'forgot-password') {
            this.sent = true;
            setTimeout(() => {
              this.sent = false;
              this.startCooldown(60);
            }, 3000);
          } else {
            this.startCooldown(60);
          }
        },
      }),
    );
  }

  private startCooldown(seconds: number): void {
    this.cooldown = seconds;
    this.subscriptions.add(
      interval(1000)
        .pipe(
          take(seconds),
          map((i) => seconds - 1 - i),
        )
        .subscribe({
          next: (remaining) => {
            this.cooldown = remaining;
          },
        }),
    );
  }
}
