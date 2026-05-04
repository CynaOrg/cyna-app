import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';
import { AppLifecycleService, StatusBarService } from '@core/native';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly statusBar = inject(StatusBarService);
  private readonly appLifecycle = inject(AppLifecycleService);

  isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  isDashboardRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/dashboard')),
    ),
    { initialValue: false },
  );

  async ngOnInit(): Promise<void> {
    // Native UX boot — these are no-ops on web / SSR (services guard
    // internally on `isNativeCapacitor()`).
    await this.statusBar.init();
    await this.appLifecycle.init();

    this.cartStore.loadCart();
  }
}
