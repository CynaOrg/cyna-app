import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorHouse,
  phosphorSquaresFour,
  phosphorChartLine,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';

interface NavItem {
  route: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent, TranslateModule],
  viewProviders: [
    provideIcons({
      phosphorHouse,
      phosphorSquaresFour,
      phosphorChartLine,
      phosphorUser,
    }),
  ],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-[max(env(safe-area-inset-bottom)-22px,4px)]"
    >
      <nav
        class="pointer-events-auto relative mx-4 flex items-center justify-around rounded-full border border-white/20 bg-white/70 py-2 shadow-lg backdrop-blur-lg transition-all duration-300 ease-in-out"
      >
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive
            #rla="routerLinkActive"
            [attr.aria-label]="item.label | translate"
            class="relative flex flex-1 items-center justify-center py-3"
            [class.text-black]="rla.isActive"
            [class.text-black/60]="!rla.isActive"
          >
            <span
              class="pointer-events-none absolute inset-0 m-auto h-10 w-13 rounded-full bg-primary/25 transition-opacity duration-200"
              [class.opacity-100]="rla.isActive"
              [class.opacity-0]="!rla.isActive"
            ></span>
            <ng-icon [name]="item.icon" size="24" class="relative z-10" />
          </a>
        }
      </nav>
    </div>
  `,
})
export class NavbarComponent {
  navItems: NavItem[] = [
    {
      route: '/home',
      label: 'NAV.HOME',
      icon: 'phosphorHouse',
    },
    {
      route: '/catalog',
      label: 'NAV.CATALOG',
      icon: 'phosphorSquaresFour',
    },
    {
      route: '/dashboard',
      label: 'NAV.DASHBOARD',
      icon: 'phosphorChartLine',
    },
    {
      route: '/account',
      label: 'NAV.ACCOUNT',
      icon: 'phosphorUser',
    },
  ];
}
