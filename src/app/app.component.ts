import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';
import { isNativeCapacitor } from '@core/utils/platform.utils';

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

  ngOnInit(): void {
    this.cartStore.loadCart();
    // When running inside Capacitor (iOS/Android native shell), redirect to
    // the dedicated `/m` native shell which mounts the native UI (header,
    // bottom nav, native pages). On web, this branch is a no-op so the
    // existing web app keeps its routing untouched.
    if (isNativeCapacitor() && !this.router.url.startsWith('/m')) {
      void this.router.navigateByUrl('/m/home');
    }
  }
}
