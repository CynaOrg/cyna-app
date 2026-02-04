import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorList,
  phosphorX,
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
  phosphorUser,
  phosphorSignIn,
} from '@ng-icons/phosphor-icons/regular';

interface NavLink {
  route: string;
  label: string;
}

@Component({
  selector: 'app-browser-header',
  standalone: true,
  host: { class: 'block' },
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  viewProviders: [
    provideIcons({
      phosphorList,
      phosphorX,
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorUser,
      phosphorSignIn,
    }),
  ],
  template: `
    <header class="relative z-50 w-full bg-surface shadow-sm">
      <!-- Desktop nav (>=768px) -->
      <nav
        class="mx-auto hidden h-16 max-w-7xl items-center justify-between px-6 md:flex"
      >
        <!-- Logo -->
        <a routerLink="/landing" class="shrink-0">
          <img src="assets/cyna-logo-baseline.svg" alt="CYNA" class="h-8" />
        </a>

        <!-- Center links -->
        <ul class="flex items-center gap-8">
          @for (link of navLinks; track link.route) {
            <li>
              <a
                [routerLink]="link.route"
                routerLinkActive="text-primary"
                class="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <!-- Right actions -->
        <div class="flex items-center gap-3">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
            aria-label="Rechercher"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          @if (isLoggedIn()) {
            <!-- Cart -->
            <a
              routerLink="/cart"
              class="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
              aria-label="Panier"
            >
              <ng-icon name="phosphorShoppingCart" size="20" />
              @if (cartCount() > 0) {
                <span
                  class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-white"
                >
                  {{ cartCount() }}
                </span>
              }
            </a>

            <!-- Account -->
            <a
              routerLink="/account"
              class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
              aria-label="Mon compte"
            >
              <ng-icon name="phosphorUser" size="20" />
            </a>
          } @else {
            <a
              routerLink="/auth/login"
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <ng-icon name="phosphorSignIn" size="16" />
              Se connecter
            </a>
          }
        </div>
      </nav>

      <!-- Mobile nav (<768px) -->
      <nav class="flex h-16 items-center justify-between px-4 md:hidden">
        <!-- Logo compact -->
        <a routerLink="/landing" class="shrink-0">
          <img src="assets/cyna-logo.svg" alt="CYNA" class="h-8 w-8" />
        </a>

        <!-- Right icons -->
        <div class="flex items-center gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary"
            aria-label="Rechercher"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          <button
            class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary"
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
        <div class="flex h-16 items-center justify-between px-4">
          <span class="text-sm font-semibold text-text-primary">Menu</span>
          <button
            class="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary"
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
                routerLinkActive="bg-primary-light text-primary"
                class="block rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors"
                (click)="mobileMenuOpen.set(false)"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <!-- Separator -->
        <div class="mx-3 my-3 border-t border-border"></div>

        <!-- Cart / Account or CTA -->
        <div class="flex flex-col gap-1 px-3">
          @if (isLoggedIn()) {
            <a
              routerLink="/cart"
              routerLinkActive="bg-primary-light text-primary"
              class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors"
              (click)="mobileMenuOpen.set(false)"
            >
              <ng-icon name="phosphorShoppingCart" size="20" />
              Panier
              @if (cartCount() > 0) {
                <span
                  class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
                >
                  {{ cartCount() }}
                </span>
              }
            </a>

            <a
              routerLink="/account"
              routerLinkActive="bg-primary-light text-primary"
              class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors"
              (click)="mobileMenuOpen.set(false)"
            >
              <ng-icon name="phosphorUser" size="20" />
              Mon compte
            </a>
          } @else {
            <a
              routerLink="/auth/login"
              class="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              (click)="mobileMenuOpen.set(false)"
            >
              <ng-icon name="phosphorSignIn" size="16" />
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
