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
  phosphorGlobe,
} from '@ng-icons/phosphor-icons/regular';
import { AnimationController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CynaLogoComponent } from '../cyna-logo/cyna-logo.component';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

interface NavLink {
  route: string;
  labelKey: string;
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
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      phosphorList,
      phosphorX,
      phosphorMagnifyingGlass,
      phosphorShoppingCart,
      phosphorUser,
      phosphorSignOut,
      phosphorGlobe,
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
                {{ link.labelKey | translate }}
              </a>
            </li>
          }
        </ul>

        <!-- Right actions -->
        <div class="flex items-center justify-end gap-3">
          <!-- Language toggle -->
          <button
            class="flex h-[38px] items-center gap-1.5 overflow-hidden !rounded-full bg-[#f6f6f6] px-3 transition-colors hover:bg-primary-light"
            style="color: #0a0a0a"
            [attr.aria-label]="'LANGUAGE.SWITCH' | translate"
            (click)="toggleLanguage()"
          >
            <ng-icon name="phosphorGlobe" size="18" />
            <span class="text-xs font-semibold">{{
              currentLang() === 'fr' ? 'FR' : 'EN'
            }}</span>
          </button>

          <button
            class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
            style="color: #0a0a0a"
            [attr.aria-label]="'NAV.SEARCH' | translate"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          <!-- Cart (always visible) -->
          <a
            routerLink="/cart"
            class="relative flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
            style="color: #0a0a0a; text-decoration: none"
            [attr.aria-label]="'NAV.CART' | translate"
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
              [attr.aria-label]="'NAV.MY_ACCOUNT' | translate"
            >
              <ng-icon name="phosphorUser" size="20" />
            </a>
            <!-- Logout -->
            <button
              class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6] transition-colors hover:bg-red-100"
              style="color: #0a0a0a"
              [attr.aria-label]="'NAV.LOGOUT' | translate"
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
              {{ 'NAV.LOGIN' | translate }}
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
            [attr.aria-label]="'NAV.SEARCH' | translate"
          >
            <ng-icon name="phosphorMagnifyingGlass" size="20" />
          </button>

          <button
            class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6]"
            style="color: #0a0a0a"
            [attr.aria-label]="
              menuVisible()
                ? ('NAV.CLOSE_MENU' | translate)
                : ('NAV.OPEN_MENU' | translate)
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
    <div class="hidden h-[96px] lg:block"></div>
    <div class="block h-[80px] lg:hidden"></div>

    <!-- Mobile slide-out panel -->
    <!-- Backdrop — always in DOM, hidden by default -->
    <div
      #backdrop
      class="fixed inset-0 z-40 bg-black/40 lg:hidden"
      style="display: none"
      (click)="closeMenu()"
    ></div>

    <!-- Panel — always in DOM, off-screen by default -->
    <div
      #panel
      class="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-surface shadow-lg lg:hidden"
      style="display: none; transform: translateX(100%)"
    >
      <!-- Panel header -->
      <div class="flex h-[80px] items-center justify-between px-8">
        <span class="text-sm font-semibold" style="color: #0a0a0a">{{
          'NAV.MENU' | translate
        }}</span>
        <button
          class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden !rounded-full bg-[#f6f6f6]"
          style="color: #0a0a0a"
          [attr.aria-label]="'NAV.CLOSE_MENU' | translate"
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
              {{ link.labelKey | translate }}
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
          {{ 'NAV.CART' | translate }}
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
            {{ 'NAV.MY_ACCOUNT' | translate }}
          </a>
          <button
            class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-red-100"
            style="color: #ef4444; width: 100%; border: none; background: none; cursor: pointer;"
            (click)="closeMenu(); onLogout()"
          >
            <ng-icon name="phosphorSignOut" size="20" />
            {{ 'NAV.LOGOUT' | translate }}
          </button>
        } @else {
          <a
            routerLink="/auth/login"
            class="flex items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-colors"
            style="background-color: #4f39f6; color: #ffffff; text-decoration: none"
            (click)="closeMenu()"
          >
            {{ 'NAV.LOGIN' | translate }}
          </a>
        }

        <!-- Language toggle in mobile menu -->
        <div class="mx-3 my-3 border-t border-black/5"></div>
        <button
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-primary-light"
          style="color: #0a0a0a; width: 100%; border: none; background: none; cursor: pointer;"
          (click)="toggleLanguage(); closeMenu()"
        >
          <ng-icon name="phosphorGlobe" size="20" />
          {{ currentLang() === 'fr' ? 'English' : 'Francais' }}
        </button>
      </div>
    </div>
  `,
})
export class BrowserHeaderComponent implements AfterViewInit {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

  cartCount = toSignal(this.cartStore.count$, { initialValue: 0 });
  isLoggedIn = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  currentLang = signal(
    this.translate.currentLang || this.translate.defaultLang,
  );

  scrolled = signal(false);

  headerClasses = computed(() => ({
    'fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out': true,
    'mt-3 w-[95%] max-w-7xl rounded-full bg-white/70 backdrop-blur-lg shadow-lg border border-white/20':
      this.scrolled(),
    'w-full bg-transparent': !this.scrolled(),
  }));

  desktopNavClasses = computed(() => ({
    'mx-auto hidden items-center px-6 lg:grid grid-cols-3 transition-all duration-300': true,
    'h-[64px]': this.scrolled(),
    'h-[96px] max-w-7xl': !this.scrolled(),
  }));

  mobileNavClasses = computed(() => ({
    'flex items-center justify-between px-8 lg:hidden transition-all duration-300': true,
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

  toggleLanguage(): void {
    const newLang = this.translate.currentLang === 'fr' ? 'en' : 'fr';
    this.translate.use(newLang);
    this.currentLang.set(newLang);
  }

  navLinks: NavLink[] = [
    { route: '/landing', labelKey: 'NAV.HOME' },
    { route: '/products', labelKey: 'NAV.PRODUCTS' },
    { route: '/services', labelKey: 'NAV.SERVICES' },
    { route: '/licenses', labelKey: 'NAV.LICENSES' },
    { route: '/contact', labelKey: 'NAV.CONTACT' },
  ];

  ngAfterViewInit() {
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
