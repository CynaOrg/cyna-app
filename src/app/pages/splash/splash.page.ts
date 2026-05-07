import { Component, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  selector: 'app-splash',
  templateUrl: 'splash.page.html',
  standalone: false,
})
export class SplashPage implements OnInit {
  isFading = false;

  private readonly navController = inject(NavController);
  private readonly header = inject(MobileHeaderService);

  ngOnInit() {
    this.header.hide();
    setTimeout(() => {
      this.isFading = true;
      setTimeout(() => {
        // Always land on the public home. Auth guards on /dashboard /account
        // handle redirection to /auth/login if the user tries to access a
        // protected page; the login page exposes the biometric quick-login
        // button when the user has previously opted in.
        this.navController.navigateRoot('/home', { animated: false });
      }, 500);
    }, 1500);
  }
}
