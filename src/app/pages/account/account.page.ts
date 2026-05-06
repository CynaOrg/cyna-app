import { Component, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorPackage,
  phosphorReceipt,
  phosphorKey,
  phosphorMapPin,
  phosphorUser,
  phosphorShield,
  phosphorGear,
  phosphorCreditCard,
} from '@ng-icons/phosphor-icons/regular';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { MobileListItemComponent } from '@shared/components/mobile-list-item/mobile-list-item.component';
import { AuthStore } from '@core/stores/auth.store';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonicModule,
    TranslateModule,
    NgIconComponent,
    MobileHeaderComponent,
    NavbarComponent,
    MobileListItemComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorPackage,
      phosphorReceipt,
      phosphorKey,
      phosphorMapPin,
      phosphorUser,
      phosphorShield,
      phosphorGear,
      phosphorCreditCard,
    }),
  ],
  template: `
    <app-mobile-header
      title="ACCOUNT.TITLE"
      [showSearch]="true"
      [showCart]="true"
      [scrolled]="scrolled()"
    />

    <ion-content
      [fullscreen]="true"
      [scrollEvents]="true"
      [style.--padding-top]="'calc(env(safe-area-inset-top) + 80px)'"
      (ionScroll)="onScroll($event)"
    >
      <!-- Section 1 — Mes données -->
      <h2
        class="px-6 pt-6 pb-2 text-xs uppercase tracking-wider text-text-muted"
      >
        {{ 'ACCOUNT.SECTION_DATA' | translate }}
      </h2>
      <div class="mx-4 my-2 rounded-xl bg-surface overflow-hidden">
        @for (item of section1Items; track item.route; let last = $last) {
          <app-mobile-list-item
            [icon]="item.icon"
            [label]="item.label"
            [routerLink]="item.route"
            [last]="last"
          />
        }
      </div>

      <!-- Section 2 — Mon profil -->
      <h2
        class="px-6 pt-6 pb-2 text-xs uppercase tracking-wider text-text-muted"
      >
        {{ 'ACCOUNT.SECTION_PROFILE' | translate }}
      </h2>
      <div class="mx-4 my-2 rounded-xl bg-surface overflow-hidden">
        @for (item of section2Items; track item.route; let last = $last) {
          <app-mobile-list-item
            [icon]="item.icon"
            [label]="item.label"
            [routerLink]="item.route"
            [last]="last"
          />
        }
      </div>

      <!-- Logout isolé en bas -->
      <button
        type="button"
        (click)="logout()"
        class="mx-4 mt-8 mb-6 w-[calc(100%-2rem)] rounded-xl bg-surface p-4 text-center font-medium text-red-600"
        style="border: none;"
      >
        {{ 'ACCOUNT.LOGOUT' | translate }}
      </button>
    </ion-content>

    <ion-footer class="ion-no-border">
      <app-navbar />
    </ion-footer>
  `,
})
export class AccountPage {
  private readonly authStore = inject(AuthStore);

  readonly section1Items: MenuItem[] = [
    {
      icon: 'phosphorPackage',
      label: 'ACCOUNT.MENU.ORDERS',
      route: '/dashboard/orders',
    },
    {
      icon: 'phosphorReceipt',
      label: 'ACCOUNT.MENU.SUBSCRIPTIONS',
      route: '/dashboard/subscriptions',
    },
    {
      icon: 'phosphorKey',
      label: 'ACCOUNT.MENU.LICENSES',
      route: '/dashboard/my-licenses',
    },
    {
      icon: 'phosphorMapPin',
      label: 'ACCOUNT.MENU.ADDRESSES',
      route: '/account/addresses',
    },
  ];

  readonly section2Items: MenuItem[] = [
    {
      icon: 'phosphorUser',
      label: 'ACCOUNT.MENU.PROFILE',
      route: '/account/profile',
    },
    {
      icon: 'phosphorShield',
      label: 'ACCOUNT.MENU.SECURITY',
      route: '/account/security',
    },
    {
      icon: 'phosphorGear',
      label: 'ACCOUNT.MENU.PREFERENCES',
      route: '/account/preferences',
    },
    {
      icon: 'phosphorCreditCard',
      label: 'ACCOUNT.MENU.BILLING',
      route: '/account/billing',
    },
  ];

  readonly scrolled = signal<boolean>(false);

  logout(): void {
    // AuthStore.logout() fire-and-forget; clearSession() inside redirects to /auth/login
    this.authStore.logout();
  }

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    const next = top > 50;
    if (next !== this.scrolled()) {
      this.scrolled.set(next);
    }
  }
}
