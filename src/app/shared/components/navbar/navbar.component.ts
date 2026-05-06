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
import {
  phosphorHouseFill,
  phosphorSquaresFourFill,
  phosphorChartLineFill,
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
  imports: [RouterLink, RouterLinkActive, NgIconComponent, TranslateModule],
  viewProviders: [
    provideIcons({
      phosphorHouse,
      phosphorHouseFill,
      phosphorSquaresFour,
      phosphorSquaresFourFill,
      phosphorChartLine,
      phosphorChartLineFill,
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
          <span class="text-xs font-normal">
            {{ item.label | translate }}
          </span>
        </a>
      }
    </nav>
  `,
})
export class NavbarComponent {
  navItems: NavItem[] = [
    {
      route: '/home',
      label: 'NAV.HOME',
      icon: 'phosphorHouse',
      iconActive: 'phosphorHouseFill',
    },
    {
      route: '/catalog',
      label: 'NAV.CATALOG',
      icon: 'phosphorSquaresFour',
      iconActive: 'phosphorSquaresFourFill',
    },
    {
      route: '/dashboard',
      label: 'NAV.DASHBOARD',
      icon: 'phosphorChartLine',
      iconActive: 'phosphorChartLineFill',
    },
    {
      route: '/account',
      label: 'NAV.ACCOUNT',
      icon: 'phosphorUser',
      iconActive: 'phosphorUserFill',
    },
  ];
}
