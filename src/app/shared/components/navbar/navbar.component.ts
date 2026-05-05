import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CartStore } from '@core/stores/cart.store';
import {
  phosphorHouse,
  phosphorSquaresFour,
  phosphorShoppingCart,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import {
  phosphorHouseFill,
  phosphorSquaresFourFill,
  phosphorShoppingCartFill,
  phosphorUserFill,
} from '@ng-icons/phosphor-icons/fill';
interface NavItem {
  route: string;
  label: string;
  icon: string;
  iconActive: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  viewProviders: [
    provideIcons({
      phosphorHouse,
      phosphorHouseFill,
      phosphorSquaresFour,
      phosphorSquaresFourFill,
      phosphorShoppingCart,
      phosphorShoppingCartFill,
      phosphorUser,
      phosphorUserFill,
    }),
  ],
  template: `
    <nav
      class="flex w-full items-center justify-between border-t border-black/5 bg-surface px-8 py-5"
    >
      @for (item of navItems; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="active"
          #rla="routerLinkActive"
          class="relative flex flex-col items-center justify-center gap-0.5"
          [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
        >
          <ng-icon
            [name]="rla.isActive ? item.iconActive : item.icon"
            size="24"
          />
          @if (item.route === '/cart' && cartCount() > 0) {
            <span
              class="absolute -right-1.5 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#4f39f6] text-[8px] font-bold leading-none text-white"
            >
              {{ cartCount() }}
            </span>
          }
          <span class="text-xs font-normal">
            {{ item.label }}
          </span>
        </a>
      }
    </nav>
  `,
})
export class NavbarComponent {
  private readonly cartStore = inject(CartStore);
  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  navItems: NavItem[] = [
    {
      route: '/home',
      label: 'Accueil',
      icon: 'phosphorHouse',
      iconActive: 'phosphorHouseFill',
    },
    {
      route: '/catalog',
      label: 'Catalogue',
      icon: 'phosphorSquaresFour',
      iconActive: 'phosphorSquaresFourFill',
    },
    {
      route: '/cart',
      label: 'Panier',
      icon: 'phosphorShoppingCart',
      iconActive: 'phosphorShoppingCartFill',
    },
    {
      route: '/account',
      label: 'Compte',
      icon: 'phosphorUser',
      iconActive: 'phosphorUserFill',
    },
  ];
}
