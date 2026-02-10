import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-email-sent',
  templateUrl: 'email-sent.page.html',
  standalone: false,
})
export class EmailSentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  type: 'register' | 'forgot-password' = 'register';
  email = '';
  initialCooldown = 60;

  get title(): string {
    return this.type === 'register' ? 'Verifiez votre email' : 'Email envoye';
  }

  get message(): string {
    if (this.type === 'register') {
      return `Nous avons envoye un email a <strong>${this.email}</strong>. Cliquez sur le lien dans l'email pour activer votre compte.`;
    }
    return `Si un compte existe avec l'adresse <strong>${this.email}</strong>, vous recevrez un lien de reinitialisation dans quelques instants.`;
  }

  get resendLabel(): string {
    return this.type === 'register'
      ? 'Renvoyer un email de verification'
      : 'Renvoyer le lien';
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
