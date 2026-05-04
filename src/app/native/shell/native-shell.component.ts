import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/**
 * Root container for the native (Capacitor) shell.
 *
 * This component is intentionally minimal: it only renders a router-outlet.
 * Native pages mounted under the `/m/*` routes provide their own layout
 * (mobile header, bottom navigation, etc.) — those will land in N1+.
 *
 * The web bundle never reaches this code path: it is lazy-loaded behind the
 * `/m` route prefix, which only the native bootstrap targets.
 */
@Component({
  selector: 'app-native-shell',
  standalone: true,
  imports: [IonicModule, RouterOutlet],
  template: `<ion-router-outlet />`,
})
export class NativeShellComponent {}
