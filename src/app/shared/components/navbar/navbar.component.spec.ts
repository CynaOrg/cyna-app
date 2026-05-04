import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { NavbarComponent } from './navbar.component';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

/**
 * Auth-aware navbar (B10.1).
 *
 * The navbar is the single mobile entry point on the marketing side, so its
 * tab list directly reflects whether the user is logged in. We exercise both
 * states explicitly to lock in the contract:
 *  - guest: Accueil / Catalogue / Panier / Connexion
 *  - logged in: Accueil / Catalogue / Panier / Espace / Compte
 */
describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;
  let isAuthenticated$: BehaviorSubject<boolean>;
  let count$: BehaviorSubject<number>;

  beforeEach(async () => {
    isAuthenticated$ = new BehaviorSubject<boolean>(false);
    count$ = new BehaviorSubject<number>(0);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: { count$ } },
        { provide: AuthStore, useValue: { isAuthenticated$ } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders 4 tabs ending with Connexion when guest', () => {
    const items = component.navItems();
    expect(items.length).toBe(4);
    expect(items.map((i) => i.route)).toEqual([
      '/home',
      '/catalog',
      '/cart',
      '/auth/login',
    ]);
    expect(items[3].label).toBe('Connexion');
  });

  it('renders 5 tabs including Dashboard + Compte when logged in', () => {
    isAuthenticated$.next(true);
    fixture.detectChanges();

    const items = component.navItems();
    expect(items.length).toBe(5);
    expect(items.map((i) => i.route)).toEqual([
      '/home',
      '/catalog',
      '/cart',
      '/dashboard',
      '/account',
    ]);
    // The Dashboard tab must use a distinct icon from Catalogue to avoid
    // visual collision in the bottom bar.
    const catalog = items.find((i) => i.route === '/catalog');
    const dashboard = items.find((i) => i.route === '/dashboard');
    expect(catalog?.icon).not.toBe(dashboard?.icon);
  });

  it('flags exactly one item as the cart anchor for the badge', () => {
    const items = component.navItems();
    const cartItems = items.filter((i) => i.cart);
    expect(cartItems.length).toBe(1);
    expect(cartItems[0].route).toBe('/cart');
  });

  it('shows the cart badge only when count > 0', () => {
    count$.next(0);
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('span.bg-primary')).length,
    ).toBe(0);

    count$.next(3);
    fixture.detectChanges();
    const badges = fixture.debugElement.queryAll(By.css('span.bg-primary'));
    expect(badges.length).toBe(1);
    expect(badges[0].nativeElement.textContent.trim()).toBe('3');
  });
});
