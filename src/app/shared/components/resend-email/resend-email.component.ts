import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval, take, map } from 'rxjs';
import { AuthStore } from '@core/stores/auth.store';

@Component({
  selector: 'app-resend-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (sent) {
      <p class="text-xs text-success">Email envoye avec succes</p>
    } @else if (cooldown > 0) {
      <p class="text-xs text-text-muted">
        Renvoyer un email dans {{ cooldown }}s
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
  @Input() label = 'Renvoyer un email de verification';
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
          // For forgot-password, always show success (anti-enumeration)
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
