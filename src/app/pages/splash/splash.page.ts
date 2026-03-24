import { Component, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  templateUrl: 'splash.page.html',
  standalone: false,
})
export class SplashPage implements OnInit {
  isFading = false;

  private readonly navController = inject(NavController);

  ngOnInit() {
    // Wait 1.5s, then start fade out
    setTimeout(() => {
      this.isFading = true;

      // After fade animation (500ms), navigate
      setTimeout(() => {
        this.navController.navigateRoot('/home', {
          animated: false,
        });
      }, 500);
    }, 1500);
  }
}
