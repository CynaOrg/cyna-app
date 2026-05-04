import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NativeMobileHeaderComponent } from '../components/native-mobile-header.component';
import { NativeBottomNavComponent } from '../components/native-bottom-nav.component';
import { StatusBarService } from '../services/status-bar.service';
import { AppLifecycleService } from '../services/app-lifecycle.service';
import { NetworkService } from '../services/network.service';
import { DeepLinkService } from '../services/deep-link.service';

/**
 * Root container for the native (Capacitor) shell.
 *
 * Wraps every native page with:
 *   - a sticky glassmorphism header (logo + search + cart);
 *   - the `<ion-content>` scroll viewport that hosts the routed page;
 *   - a fixed bottom navigation bar that swaps between guest (4 tabs) and
 *     authenticated (5 tabs) layouts.
 *
 * On mount, the shell wires the native-only side effects (status bar
 * styling, lifecycle listeners, network state, deep links). Each service
 * already short-circuits on the web — but the shell itself only ever loads
 * inside the native bundle, so these calls are reached from native devices
 * only.
 *
 * The Ionic mode is left to the global config (`IonicModule.forRoot`) — see
 * `app.module.ts`. We deliberately do not call `provideIonicAngular({ mode })`
 * here because that would conflict with the existing root config and risk
 * leaking iOS styling into the web build.
 */
@Component({
  selector: 'app-native-shell',
  standalone: true,
  imports: [
    IonicModule,
    RouterOutlet,
    NativeMobileHeaderComponent,
    NativeBottomNavComponent,
  ],
  template: `
    <ion-app>
      <app-native-mobile-header />
      <ion-content>
        <router-outlet />
      </ion-content>
      <app-native-bottom-nav />
    </ion-app>
  `,
})
export class NativeShellComponent implements OnInit {
  private readonly statusBar = inject(StatusBarService);
  private readonly lifecycle = inject(AppLifecycleService);
  private readonly network = inject(NetworkService);
  private readonly deepLink = inject(DeepLinkService);

  async ngOnInit(): Promise<void> {
    // Each service is idempotent and a no-op on the web. We catch each init
    // independently so a single broken plugin can't keep the shell from
    // rendering, then await them in parallel.
    const safe = (p: Promise<void>): Promise<void> =>
      p.catch(() => undefined);
    await Promise.all([
      safe(this.statusBar.init()),
      safe(this.lifecycle.init()),
      safe(this.network.init()),
      safe(this.deepLink.init()),
    ]);
  }
}
