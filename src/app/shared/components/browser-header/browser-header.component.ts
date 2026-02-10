import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgClass, AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorList,
  phosphorX,
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
  phosphorUser,
  phosphorSignOut,
} from '@ng-icons/phosphor-icons/regular';
import { AnimationController } from '@ionic/angular';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

interface NavLink {
  route: string;
  label: string;
}

@Component({
  selector: 'app-browser-header',
  standalone: true,
  host: { class: 'block' },
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIconComponent,
    CynaLogoComponent,
    NgClass,
  ],
  viewProviders: [
    provideIcons({
      phosphorList,
      phosphorX,
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorUser,
      phosphorSignOut,
    }),
  ],
  template: `
    <header [ngClass]="headerClasses()">
      <!-- Desktop nav (>=768px) -->
      <nav [ngClass]="desktopNavClasses()">
        <!-- Logo -->
        <a
          routerLink="/landing"
          class="shrink-0 justify-self-start"
          style="text-decoration: none"
        >
          <app-cyna-logo variant="full" color="#0A0A0A" />
        </a>

        <!-- Center links -->
        <ul class="flex items-center justify-center gap-8">
          @for (link of navLinks; track link.route) {
            <li>
              <a
                [routerLink]="link.route"
                routerLinkActive="active"
                #rla="routerLinkActive"
                [style.color]="rla.isActive ? '#4f39f6' : '#0a0a0a'"
                [style.text-decoration]="'none'"
                class="text-[15px] font-medium transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <!-- Right actions -->
        <div class="flex items-center justify-end gap-3">
          <button
            class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
            style="color: #0a0a0a"
            aria-label="Rechercher"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          <!-- Cart (always visible) -->
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

          @if (isLoggedIn()) {
            <!-- Account -->
            <a
              routerLink="/account"
              class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
              style="color: #0a0a0a; text-decoration: none"
              aria-label="Mon compte"
            >
              <ng-icon name="phosphorUser" size="20" />
            </a>
            <!-- Logout -->
            <button
              class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6] transition-colors hover:bg-red-100"
              style="color: #0a0a0a"
              aria-label="Se deconnecter"
              (click)="onLogout()"
            >
              <ng-icon name="phosphorSignOut" size="20" />
            </button>
          } @else {
            <a
              routerLink="/auth/login"
              class="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-medium transition-colors"
              style="background-color: #4f39f6; color: #ffffff; text-decoration: none"
            >
              Se connecter
            </a>
          }
        </div>
      </nav>

      <!-- Mobile nav (<768px) -->
      <nav [ngClass]="mobileNavClasses()">
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
              menuVisible() ? 'Fermer le menu' : 'Ouvrir le menu'
            "
            (click)="menuVisible() ? closeMenu() : openMenu()"
          >
            <ng-icon
              [name]="menuVisible() ? 'phosphorX' : 'phosphorList'"
              size="22"
            />
          </button>
        </div>
      </nav>
    </header>

    <!-- Spacer to compensate for fixed header -->
    <div class="hidden h-[96px] md:block"></div>
    <div class="block h-[80px] md:hidden"></div>

    <!-- Mobile slide-out panel -->
    <!-- Backdrop — always in DOM, hidden by default -->
    <div
      #backdrop
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      style="display: none"
      (click)="closeMenu()"
    ></div>

    <!-- Panel — always in DOM, off-screen by default -->
    <div
      #panel
      class="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-surface shadow-lg md:hidden"
      style="display: none; transform: translateX(100%)"
    >
      <!-- Panel header -->
      <div class="flex h-[80px] items-center justify-between px-8">
        <span class="text-sm font-semibold" style="color: #0a0a0a">Menu</span>
        <button
          class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6]"
          style="color: #0a0a0a"
          aria-label="Fermer le menu"
          (click)="closeMenu()"
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
              class="block rounded-lg px-4 py-3 text-sm font-medium transition-colors"
              [class.bg-primary-light]="rlaM.isActive"
              (click)="closeMenu()"
            >
              {{ link.label }}
            </a>
          </li>
        }
      </ul>

      <!-- Separator -->
      <div class="mx-3 my-3 border-t border-black/5"></div>

      <!-- Cart (always visible) -->
      <div class="flex flex-col gap-1 px-3">
        <a
          routerLink="/cart"
          routerLinkActive="active"
          #rlaCart="routerLinkActive"
          [style.color]="rlaCart.isActive ? '#4f39f6' : '#0a0a0a'"
          [style.text-decoration]="'none'"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          [class.bg-primary-light]="rlaCart.isActive"
          (click)="closeMenu()"
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

        @if (isLoggedIn()) {
          <a
            routerLink="/account"
            routerLinkActive="active"
            #rlaAccount="routerLinkActive"
            [style.color]="rlaAccount.isActive ? '#4f39f6' : '#0a0a0a'"
            [style.text-decoration]="'none'"
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            [class.bg-primary-light]="rlaAccount.isActive"
            (click)="closeMenu()"
          >
            <ng-icon name="phosphorUser" size="20" />
            Mon compte
          </a>
          <button
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-red-100"
            style="color: #ef4444; width: 100%; border: none; background: none; cursor: pointer;"
            (click)="closeMenu(); onLogout()"
          >
            <ng-icon name="phosphorSignOut" size="20" />
            Se deconnecter
          </button>
        } @else {
          <a
            routerLink="/auth/login"
            class="flex items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-colors"
            style="background-color: #4f39f6; color: #ffffff; text-decoration: none"
            (click)="closeMenu()"
          >
            Se connecter
          </a>
        }
      </div>
    </div>
  `,
})
export class BrowserHeaderComponent implements AfterViewInit {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });
  isLoggedIn = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  scrolled = signal(false);

  // Computed class objects for ngClass (avoids [class] string concatenation issues with Ionic/Stencil)
  headerClasses = computed(() => ({
    'fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out': true,
    'mt-3 w-[95%] max-w-7xl rounded-full bg-white/70 backdrop-blur-lg shadow-lg border border-white/20':
      this.scrolled(),
    'w-full bg-transparent': !this.scrolled(),
  }));

  desktopNavClasses = computed(() => ({
    'mx-auto hidden items-center px-6 md:grid grid-cols-3 transition-all duration-300': true,
    'h-[64px]': this.scrolled(),
    'h-[96px] max-w-7xl': !this.scrolled(),
  }));

  mobileNavClasses = computed(() => ({
    'flex items-center justify-between px-8 md:hidden transition-all duration-300': true,
    'h-[60px]': this.scrolled(),
    'h-[80px]': !this.scrolled(),
  }));

  private animationCtrl = inject(AnimationController);
  private el = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  backdrop = viewChild<ElementRef>('backdrop');
  panel = viewChild<ElementRef>('panel');

  menuVisible = signal(false);

  onLogout(): void {
    this.authStore.logout();
  }

  navLinks: NavLink[] = [
    { route: '/landing', label: 'Accueil' },
    { route: '/products', label: 'Produits' },
    { route: '/services', label: 'Services' },
    { route: '/contact', label: 'Contact' },
  ];

  ngAfterViewInit() {
    // ion-content is a sibling of ion-header (which contains this component)
    const ionHeader = this.el.nativeElement.closest('ion-header');
    const ionContent = ionHeader?.parentElement?.querySelector('ion-content');

    if (ionContent) {
      ionContent.scrollEvents = true;

      const onScroll = (e: CustomEvent) => {
        this.scrolled.set(e.detail.scrollTop > 50);
      };

      ionContent.addEventListener('ionScroll', onScroll);

      this.destroyRef.onDestroy(() => {
        ionContent.removeEventListener('ionScroll', onScroll);
      });
    }
  }

  async openMenu() {
    const backdropEl = this.backdrop()!.nativeElement;
    const panelEl = this.panel()!.nativeElement;

    backdropEl.style.display = 'block';
    panelEl.style.display = 'flex';
    this.menuVisible.set(true);

    const backdropAnim = this.animationCtrl
      .create()
      .addElement(backdropEl)
      .duration(250)
      .easing('ease-out')
      .fromTo('opacity', '0', '1');

    const panelAnim = this.animationCtrl
      .create()
      .addElement(panelEl)
      .duration(250)
      .easing('ease-out')
      .fromTo('transform', 'translateX(100%)', 'translateX(0)');

    await this.animationCtrl
      .create()
      .addAnimation([backdropAnim, panelAnim])
      .play();
  }

  async closeMenu() {
    const backdropEl = this.backdrop()!.nativeElement;
    const panelEl = this.panel()!.nativeElement;

    const backdropAnim = this.animationCtrl
      .create()
      .addElement(backdropEl)
      .duration(250)
      .easing('ease-in')
      .fromTo('opacity', '1', '0');

    const panelAnim = this.animationCtrl
      .create()
      .addElement(panelEl)
      .duration(250)
      .easing('ease-in')
      .fromTo('transform', 'translateX(0)', 'translateX(100%)');

    await this.animationCtrl
      .create()
      .addAnimation([backdropAnim, panelAnim])
      .play();

    backdropEl.style.display = 'none';
    panelEl.style.display = 'none';
    this.menuVisible.set(false);
  }
}
