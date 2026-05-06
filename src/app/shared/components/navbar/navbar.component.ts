import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNativeCapacitor } from '@core/utils/platform.utils';
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
      class="flex w-full items-center justify-between border-t border-black/5 bg-surface px-8 py-3"
    >
      @for (item of navItems; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="active"
          #rla="routerLinkActive"
          (click)="onTabTap()"
          class="relative flex flex-col items-center justify-center gap-0.5 pt-1.5 pb-2"
          [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
        >
          <ng-icon
            [name]="rla.isActive ? item.iconActive : item.icon"
            size="24"
            class="transition-transform duration-200 ease-out"
            [class.scale-110]="rla.isActive"
          />
          <span class="text-xs font-normal">
            {{ item.label | translate }}
          </span>
          @if (rla.isActive) {
            <span
              class="absolute -bottom-0.5 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-primary transition-all duration-200 ease-out"
            ></span>
          }
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

  /**
   * Trigger a light haptic impact on tab tap (iOS / Android only).
   * Errors are swallowed because the simulator silently no-ops haptics
   * while still resolving the promise; failures on web (where the
   * navbar shouldn't render anyway) are not user-visible.
   */
  async onTabTap(): Promise<void> {
    if (!isNativeCapacitor()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Silently ignore — haptics are a polish, not a hard requirement.
    }
  }
}
