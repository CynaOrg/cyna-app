import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { NativeBottomNavComponent } from './native-bottom-nav.component';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';

describe('NativeBottomNavComponent', () => {
  let count$: BehaviorSubject<number>;
  let isAuthenticated$: BehaviorSubject<boolean>;

  function setup(): { fixture: ReturnType<typeof TestBed.createComponent> } {
    const fixture = TestBed.createComponent(NativeBottomNavComponent);
    fixture.detectChanges();
    return { fixture };
  }

  beforeEach(async () => {
    count$ = new BehaviorSubject<number>(0);
    isAuthenticated$ = new BehaviorSubject<boolean>(false);

    await TestBed.configureTestingModule({
      imports: [NativeBottomNavComponent],
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: { count$ } },
        { provide: AuthStore, useValue: { isAuthenticated$ } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the bottom nav', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders 4 tabs for guests with the login link', () => {
    const { fixture } = setup();
    const tabs = fixture.nativeElement.querySelectorAll('nav a');
    expect(tabs.length).toBe(4);
    const routes = Array.from(tabs).map((a) =>
      (a as HTMLAnchorElement).getAttribute('href'),
    );
    expect(routes).toContain('/m/auth/login');
    expect(routes).not.toContain('/m/dashboard');
  });

  it('renders 5 tabs for authenticated users', () => {
    isAuthenticated$.next(true);
    const { fixture } = setup();
    const tabs = fixture.nativeElement.querySelectorAll('nav a');
    expect(tabs.length).toBe(5);
    const routes = Array.from(tabs).map((a) =>
      (a as HTMLAnchorElement).getAttribute('href'),
    );
    expect(routes).toContain('/m/dashboard');
    expect(routes).toContain('/m/dashboard/account');
    expect(routes).not.toContain('/m/auth/login');
  });

  it('shows the cart badge when there are items', () => {
    count$.next(2);
    const { fixture } = setup();
    const badge = fixture.nativeElement.querySelector('.bg-red-600');
    expect(badge).not.toBeNull();
    expect((badge as HTMLElement).textContent?.trim()).toBe('2');
  });

  it('hides the cart badge when the cart is empty', () => {
    const { fixture } = setup();
    const badge = fixture.nativeElement.querySelector('.bg-red-600');
    expect(badge).toBeNull();
  });
});
