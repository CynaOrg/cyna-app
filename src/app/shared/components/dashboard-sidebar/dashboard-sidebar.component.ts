import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorSquaresFour,
  phosphorPackage,
  phosphorShieldCheck,
  phosphorCertificate,
  phosphorShoppingCart,
  phosphorUser,
  phosphorSignOut,
  phosphorGlobe,
  phosphorEnvelope,
} from '@ng-icons/phosphor-icons/regular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

interface SidebarLink {
  route: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIconComponent,
    CynaLogoComponent,
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      phosphorSquaresFour,
      phosphorPackage,
      phosphorShieldCheck,
      phosphorCertificate,
      phosphorShoppingCart,
      phosphorUser,
      phosphorSignOut,
      phosphorGlobe,
      phosphorEnvelope,
    }),
  ],
  template: `
    <aside
      class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border-light bg-surface"
    >
      <!-- Logo -->
      <div class="flex h-20 items-center px-6">
        <a routerLink="/landing" style="text-decoration: none">
          <app-cyna-logo variant="full" color="#0A0A0A" />
        </a>
      </div>

      <!-- Top nav links -->
      <nav class="flex flex-1 flex-col gap-1 px-3 pt-2">
        @for (link of topLinks; track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="active"
            #rla="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: link.route === '/dashboard' }"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rla.isActive"
            [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
            style="text-decoration: none"
          >
            <ng-icon [name]="link.icon" size="20" />
            {{ link.labelKey | translate }}
          </a>
        }
      </nav>

      <!-- Bottom section -->
      <div class="flex flex-col gap-1 border-t border-border-light px-3 py-4">
        <!-- Cart -->
        <a
          routerLink="/cart"
          routerLinkActive="active"
          #rlaCart="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaCart.isActive"
          [style.color]="rlaCart.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
        >
          <ng-icon name="phosphorShoppingCart" size="20" />
          {{ 'NAV.CART' | translate }}
          @if (cartCount() > 0) {
            <span
              class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
            >
              {{ cartCount() }}
            </span>
          }
        </a>

        <!-- Language -->
        <button
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; cursor: pointer"
          [attr.aria-label]="'LANGUAGE.SWITCH' | translate"
          (click)="toggleLanguage()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'Francais' : 'English' }}
          <span
            class="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-text-secondary"
          >
            {{ currentLang() === 'fr' ? 'FR' : 'EN' }}
          </span>
        </button>

        <!-- Account -->
        <a
          routerLink="/account"
          routerLinkActive="active"
          #rlaAccount="routerLinkActive"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaAccount.isActive"
          [style.color]="rlaAccount.isActive ? '#4f39f6' : '#0a0a0a'"
          style="text-decoration: none"
        >
          <ng-icon name="phosphorUser" size="20" />
          {{ 'NAV.MY_ACCOUNT' | translate }}
        </a>

        <!-- Logout -->
        <button
          class="flex w-full items-center gap-3 rounded-lg border-none bg-transparent px-4 py-3 text-sm font-medium transition-colors hover:bg-error-light"
          style="color: #ff383c; cursor: pointer"
          (click)="onLogout()"
        >
          <ng-icon name="phosphorSignOut" size="20" />
          {{ 'NAV.LOGOUT' | translate }}
        </button>
      </div>
    </aside>
  `,
})
export class DashboardSidebarComponent {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });

  currentLang = signal(
    this.translate.currentLang || this.translate.defaultLang,
  );

  topLinks: SidebarLink[] = [
    {
      route: '/dashboard',
      labelKey: 'NAV.DASHBOARD',
      icon: 'phosphorSquaresFour',
    },
    { route: '/products', labelKey: 'NAV.PRODUCTS', icon: 'phosphorPackage' },
    {
      route: '/services',
      labelKey: 'NAV.SERVICES',
      icon: 'phosphorShieldCheck',
    },
    {
      route: '/licenses',
      labelKey: 'NAV.LICENSES',
      icon: 'phosphorCertificate',
    },
    {
      route: '/contact',
      labelKey: 'NAV.CONTACT',
      icon: 'phosphorEnvelope',
    },
  ];

  onLogout(): void {
    this.authStore.logout();
  }

  toggleLanguage(): void {
    const newLang = this.translate.currentLang === 'fr' ? 'en' : 'fr';
    this.translate.use(newLang);
    this.currentLang.set(newLang);
    document.cookie = `cyna_lang=${newLang};path=/;max-age=31536000;SameSite=Strict`;
  }
}
