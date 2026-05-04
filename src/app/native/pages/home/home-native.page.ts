import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/**
 * Placeholder native home page used to wire `/m/home` while the real page is
 * implemented in N3. It only exists to validate the shell renders correctly.
 */
@Component({
  selector: 'app-home-native',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-content class="ion-padding">
      <h1 class="text-xl font-semibold">Home Native — placeholder</h1>
      <p class="mt-2 text-sm text-black/60">
        Cette page sera remplacée par la vraie home native dans le lot N3.
      </p>
    </ion-content>
  `,
})
export class HomeNativePage {}
