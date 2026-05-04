import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorHouse,
  phosphorSquaresFour,
  phosphorShoppingCart,
  phosphorUser,
  phosphorSignIn,
  phosphorGauge,
} from '@ng-icons/phosphor-icons/regular';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

interface NavItem {
  route: string;
  label: string;
  icon: string;
  /** When true, the cart badge will be displayed on this item. */
  cart?: boolean;
}

/**
 * Marketing-side bottom tab bar (mobile only).
 *
 * Native polish (B10.1):
 *  - Glassmorphism (semi-transparent surface + backdrop blur), mirroring the
 *    dashboard topbar / new mobile header.
 *  - Sober Phosphor regular icons (no fill swap), same family as the
 *    dashboard sidebar links.
 *  - Auth-aware: 4 tabs when guest (Connexion replacing Compte), 5 tabs when
 *    logged in (with a Dashboard shortcut).
 *  - Honours iOS home-indicator safe area via env(safe-area-inset-bottom).
 *  - Active tab uses the Cyna primary color, inactive items the standard
 *    text color, both readable against the blurred background.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  viewProviders: [
    provideIcons({
      phosphorHouse,
      phosphorSquaresFour,
      phosphorShoppingCart,
      phosphorUser,
      phosphorSignIn,
      phosphorGauge,
    }),
  ],
  template: `
    <nav
      class="fixed bottom-0 left-0 right-0 z-30 flex w-full items-stretch justify-around border-t border-border-light bg-surface/85 backdrop-blur-xl"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      @for (item of navItems(); track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="active"
          #rla="routerLinkActive"
          class="relative flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2"
          [style.color]="rla.isActive ? '#1447E6' : '#0a0a0a'"
          style="text-decoration: none"
        >
          <span class="relative flex items-center justify-center">
            <ng-icon [name]="item.icon" size="22" />
            @if (item.cart && cartCount() > 0) {
              <span
                class="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-white"
              >
                {{ cartCount() }}
              </span>
            }
          </span>
          <span class="text-[10px] font-medium leading-none">
            {{ item.label }}
          </span>
        </a>
      }
    </nav>
  `,
})
export class NavbarComponent {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });
  isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  /**
   * Reactive nav items. We expose a `computed` rather than a static list so
   * the bar updates the moment the auth state flips (login/logout) without
   * any imperative refresh.
   */
  navItems = computed<NavItem[]>(() => {
    const baseItems: NavItem[] = [
      { route: '/home', label: 'Accueil', icon: 'phosphorHouse' },
      { route: '/catalog', label: 'Catalogue', icon: 'phosphorSquaresFour' },
      {
        route: '/cart',
        label: 'Panier',
        icon: 'phosphorShoppingCart',
        cart: true,
      },
    ];

    if (this.isAuthenticated()) {
      return [
        ...baseItems,
        {
          route: '/dashboard',
          label: 'Espace',
          icon: 'phosphorGauge',
        },
        { route: '/account', label: 'Compte', icon: 'phosphorUser' },
      ];
    }

    return [
      ...baseItems,
      {
        route: '/auth/login',
        label: 'Connexion',
        icon: 'phosphorSignIn',
      },
    ];
  });
}
