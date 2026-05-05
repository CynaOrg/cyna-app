import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
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
  tab: string;
  label: string;
  icon: string;
  iconActive: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, NgIconComponent],
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
  styles: [
    `
      ion-tab-bar {
        --background: #ffffff;
        --border: 1px solid rgba(0, 0, 0, 0.05);
        --color: #0a0a0a;
        --color-selected: #4f39f6;
        height: 64px;
        padding-top: 4px;
      }

      ion-tab-button {
        --padding-top: 0;
        --padding-bottom: 0;
      }

      ion-tab-button ion-label {
        font-size: 12px;
        font-weight: 400;
        margin-top: 2px;
      }
    `,
  ],
  template: `
    <ion-tab-bar slot="bottom">
      @for (item of navItems; track item.tab) {
        <ion-tab-button
          [tab]="item.tab"
          [routerLink]="item.route"
          routerLinkActive="tab-selected"
          #rla="routerLinkActive"
        >
          <ng-icon
            [name]="rla.isActive ? item.iconActive : item.icon"
            size="24"
            [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
          />
          <ion-label [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'">
            {{ item.label }}
          </ion-label>
          @if (item.route === '/cart' && cartCount() > 0) {
            <ion-badge color="primary">{{ cartCount() }}</ion-badge>
          }
        </ion-tab-button>
      }
    </ion-tab-bar>
  `,
})
export class NavbarComponent {
  private readonly cartStore = inject(CartStore);
  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  navItems: NavItem[] = [
    {
      route: '/home',
      tab: 'home',
      label: 'Accueil',
      icon: 'phosphorHouse',
      iconActive: 'phosphorHouseFill',
    },
    {
      route: '/catalog',
      tab: 'catalog',
      label: 'Catalogue',
      icon: 'phosphorSquaresFour',
      iconActive: 'phosphorSquaresFourFill',
    },
    {
      route: '/cart',
      tab: 'cart',
      label: 'Panier',
      icon: 'phosphorShoppingCart',
      iconActive: 'phosphorShoppingCartFill',
    },
    {
      route: '/account',
      tab: 'account',
      label: 'Compte',
      icon: 'phosphorUser',
      iconActive: 'phosphorUserFill',
    },
  ];
}
