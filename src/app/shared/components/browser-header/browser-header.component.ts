import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorList,
  phosphorX,
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';

interface NavLink {
  route: string;
  label: string;
}

@Component({
  selector: 'app-browser-header',
  standalone: true,
  host: { class: 'block' },
  imports: [RouterLink, RouterLinkActive, NgIconComponent, CynaLogoComponent],
  viewProviders: [
    provideIcons({
      phosphorList,
      phosphorX,
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorUser,
    }),
  ],
  template: `
    <header class="relative z-50 w-full bg-surface border-b border-black/5">
      <!-- Desktop nav (>=768px) -->
      <nav
        class="mx-auto hidden h-16 max-w-7xl items-center justify-between px-6 md:flex"
      >
        <!-- Logo -->
        <a routerLink="/landing" class="shrink-0" style="text-decoration: none">
          <app-cyna-logo variant="full" color="#0A0A0A" />
        </a>

        <!-- Center links -->
        <ul class="flex items-center gap-8">
          @for (link of navLinks; track link.route) {
            <li>
              <a
                [routerLink]="link.route"
                routerLinkActive="active"
                #rla="routerLinkActive"
                [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
                [style.text-decoration]="'none'"
                class="text-sm font-medium transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <!-- Right actions -->
        <div class="flex items-center gap-3">
          <button
            class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
            style="color: #0a0a0a"
            aria-label="Rechercher"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          @if (isLoggedIn()) {
            <!-- Cart -->
            <a
              routerLink="/cart"
              class="relative flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
              style="color: #0a0a0a; text-decoration: none"
              aria-label="Panier"
            >
              <ng-icon name="phosphorShoppingCart" size="20" />
              @if (cartCount() > 0) {
                <span
                  class="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#4f39f6] text-[8px] font-bold leading-none text-white"
                >
                  {{ cartCount() }}
                </span>
              }
            </a>

            <!-- Account -->
            <a
              routerLink="/account"
              class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
              style="color: #0a0a0a; text-decoration: none"
              aria-label="Mon compte"
            >
              <ng-icon name="phosphorUser" size="20" />
            </a>
          } @else {
            <a
              routerLink="/auth/login"
              class="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-colors"
              style="background-color: #4f39f6; color: #ffffff; text-decoration: none"
            >
              Se connecter
            </a>
          }
        </div>
      </nav>

      <!-- Mobile nav (<768px) -->
      <nav class="flex h-[80px] items-center justify-between px-8 md:hidden">
        <!-- Logo compact -->
        <a routerLink="/landing" class="shrink-0" style="text-decoration: none">
          <app-cyna-logo variant="mark" color="#0A0A0A" />
        </a>

        <!-- Right icons -->
        <div class="flex items-center gap-2">
          <button
            class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6]"
            style="color: #0a0a0a"
            aria-label="Rechercher"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          <button
            class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6]"
            style="color: #0a0a0a"
            [attr.aria-label]="
              mobileMenuOpen() ? 'Fermer le menu' : 'Ouvrir le menu'
            "
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
          >
            <ng-icon
              [name]="mobileMenuOpen() ? 'phosphorX' : 'phosphorList'"
              size="22"
            />
          </button>
        </div>
      </nav>
    </header>

    <!-- Mobile slide-out panel -->
    @if (mobileMenuOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        (click)="mobileMenuOpen.set(false)"
      ></div>

      <!-- Panel -->
      <div
        class="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-surface shadow-lg md:hidden"
      >
        <!-- Panel header -->
        <div class="flex h-[80px] items-center justify-between px-8">
          <span class="text-sm font-semibold" style="color: #0a0a0a">Menu</span>
          <button
            class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6]"
            style="color: #0a0a0a"
            aria-label="Fermer le menu"
            (click)="mobileMenuOpen.set(false)"
          >
            <ng-icon name="phosphorX" size="22" />
          </button>
        </div>

        <!-- Nav links -->
        <ul class="flex flex-col gap-1 px-3">
          @for (link of navLinks; track link.route) {
            <li>
              <a
                [routerLink]="link.route"
                routerLinkActive="active"
                #rlaM="routerLinkActive"
                [style.color]="rlaM.isActive ? '#4f39f6' : '#0a0a0a'"
                [style.text-decoration]="'none'"
                [class]="
                  'block rounded-lg px-4 py-3 text-sm font-medium transition-colors ' +
                  (rlaM.isActive ? 'bg-primary-light' : '')
                "
                (click)="mobileMenuOpen.set(false)"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <!-- Separator -->
        <div class="mx-3 my-3 border-t border-black/5"></div>

        <!-- Cart / Account or CTA -->
        <div class="flex flex-col gap-1 px-3">
          @if (isLoggedIn()) {
            <a
              routerLink="/cart"
              routerLinkActive="active"
              #rlaCart="routerLinkActive"
              [style.color]="rlaCart.isActive ? '#4f39f6' : '#0a0a0a'"
              [style.text-decoration]="'none'"
              [class]="
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ' +
                (rlaCart.isActive ? 'bg-primary-light' : '')
              "
              (click)="mobileMenuOpen.set(false)"
            >
              <ng-icon name="phosphorShoppingCart" size="20" />
              Panier
              @if (cartCount() > 0) {
                <span
                  class="ml-auto flex h-3 w-3 items-center justify-center rounded-full bg-[#4f39f6] text-[8px] font-bold text-white"
                >
                  {{ cartCount() }}
                </span>
              }
            </a>

            <a
              routerLink="/account"
              routerLinkActive="active"
              #rlaAccount="routerLinkActive"
              [style.color]="rlaAccount.isActive ? '#4f39f6' : '#0a0a0a'"
              [style.text-decoration]="'none'"
              [class]="
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ' +
                (rlaAccount.isActive ? 'bg-primary-light' : '')
              "
              (click)="mobileMenuOpen.set(false)"
            >
              <ng-icon name="phosphorUser" size="20" />
              Mon compte
            </a>
          } @else {
            <a
              routerLink="/auth/login"
              class="flex items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-colors"
              style="background-color: #4f39f6; color: #ffffff; text-decoration: none"
              (click)="mobileMenuOpen.set(false)"
            >
              Se connecter
            </a>
          }
        </div>
      </div>
    }
  `,
})
export class BrowserHeaderComponent {
  cartCount = input(0);
  isLoggedIn = input(false);

  mobileMenuOpen = signal(false);

  navLinks: NavLink[] = [
    { route: '/landing', label: 'Accueil' },
    { route: '/products', label: 'Produits' },
    { route: '/services', label: 'Services' },
    { route: '/contact', label: 'Contact' },
  ];
}
