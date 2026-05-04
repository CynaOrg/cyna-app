import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorHouse,
  phosphorSquaresFour,
  phosphorShoppingCart,
  phosphorSignIn,
  phosphorGauge,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

interface BottomNavItem {
  route: string;
  label: string;
  icon: string;
  /** When true, the cart count badge is rendered on the icon. */
  isCart?: boolean;
  exact?: boolean;
}

/**
 * Native bottom navigation bar.
 *
 * - 4 tabs for guests (Home, Catalog, Cart, Login)
 * - 5 tabs for authenticated users (Home, Catalog, Cart, Dashboard, Account)
 *
 * Routes are prefixed with `/m` to stay inside the native shell. The web
 * navbar (`app-navbar`) under `src/app/shared/` is left intact.
 */
@Component({
  selector: 'app-native-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  viewProviders: [
    provideIcons({
      phosphorHouse,
      phosphorSquaresFour,
      phosphorShoppingCart,
      phosphorSignIn,
      phosphorGauge,
      phosphorUser,
    }),
  ],
  template: `
    <nav
      class="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-white/85 backdrop-blur-xl"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <div class="flex min-h-[64px] w-full items-stretch justify-around px-2">
        @for (item of items(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive
            #rla="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: !!item.exact }"
            class="relative flex flex-1 flex-col items-center justify-center gap-0.5"
            [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
            style="text-decoration: none;"
          >
            <span class="relative inline-flex">
              <ng-icon [name]="item.icon" size="22" />
              @if (item.isCart && cartCount() > 0) {
                <span
                  class="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white"
                >
                  {{ cartCount() }}
                </span>
              }
            </span>
            <span class="text-[10px] font-medium">{{ item.label }}</span>
          </a>
        }
      </div>
    </nav>
  `,
})
export class NativeBottomNavComponent {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);

  readonly cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });
  readonly isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  /** Static lists keep template logic minimal and readable. */
  private readonly guestItems: BottomNavItem[] = [
    {
      route: '/m/home',
      label: 'Accueil',
      icon: 'phosphorHouse',
    },
    {
      route: '/m/catalog',
      label: 'Catalogue',
      icon: 'phosphorSquaresFour',
    },
    {
      route: '/m/cart',
      label: 'Panier',
      icon: 'phosphorShoppingCart',
      isCart: true,
    },
    {
      route: '/m/auth/login',
      label: 'Connexion',
      icon: 'phosphorSignIn',
    },
  ];

  private readonly loggedItems: BottomNavItem[] = [
    {
      route: '/m/home',
      label: 'Accueil',
      icon: 'phosphorHouse',
    },
    {
      route: '/m/catalog',
      label: 'Catalogue',
      icon: 'phosphorSquaresFour',
    },
    {
      route: '/m/cart',
      label: 'Panier',
      icon: 'phosphorShoppingCart',
      isCart: true,
    },
    {
      route: '/m/dashboard',
      label: 'Espace',
      icon: 'phosphorGauge',
    },
    {
      route: '/m/dashboard/account',
      label: 'Compte',
      icon: 'phosphorUser',
    },
  ];

  readonly items = computed<BottomNavItem[]>(() =>
    this.isAuthenticated() ? this.loggedItems : this.guestItems,
  );
}
