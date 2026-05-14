import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { authGuard, guestGuard } from './auth.guard';
import { AuthStore } from '../stores/auth.store';

describe('auth guards', () => {
  let isAuthenticated$: BehaviorSubject<boolean>;
  let authStore: Partial<AuthStore>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    isAuthenticated$ = new BehaviorSubject<boolean>(false);
    authStore = {
      isAuthenticated$: isAuthenticated$.asObservable(),
      tryRestoreSession: () => of(undefined),
    };
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStore },
        { provide: Router, useValue: router },
      ],
    });
  });

  describe('authGuard', () => {
    const run = (state: Partial<RouterStateSnapshot> = {}) =>
      TestBed.runInInjectionContext(() =>
        authGuard(
          null as never,
          { url: '/dashboard', ...state } as RouterStateSnapshot,
        ),
      );

    it('allows access when already authenticated', async () => {
      isAuthenticated$.next(true);
      const r = await firstValueFrom(run() as never);
      expect(r).toBeTrue();
    });

    it('attempts to restore session when not authenticated', async () => {
      isAuthenticated$.next(false);
      // simulate successful restore
      (authStore as any).tryRestoreSession = () => {
        isAuthenticated$.next(true);
        return of(undefined);
      };
      const r = await firstValueFrom(run() as never);
      expect(r).toBeTrue();
    });

    it('redirects to login with returnUrl when restore fails', async () => {
      isAuthenticated$.next(false);
      (authStore as any).tryRestoreSession = () => of(undefined);
      const r = await firstValueFrom(run() as never);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/dashboard' },
      });
      expect(r).toBeTruthy();
    });

    it('redirects to login when restore throws', async () => {
      isAuthenticated$.next(false);
      (authStore as any).tryRestoreSession = () =>
        throwError(() => new Error('boom'));
      const r = await firstValueFrom(run() as never);
      expect(router.createUrlTree).toHaveBeenCalled();
      expect(r).toBeTruthy();
    });
  });

  describe('guestGuard', () => {
    const run = () =>
      TestBed.runInInjectionContext(() =>
        guestGuard(null as never, null as never),
      );

    it('redirects to /landing when already authenticated', async () => {
      isAuthenticated$.next(true);
      await firstValueFrom(run() as never);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/landing']);
    });

    it('allows access when not authenticated and restore fails', async () => {
      isAuthenticated$.next(false);
      (authStore as any).tryRestoreSession = () =>
        throwError(() => new Error('x'));
      const r = await firstValueFrom(run() as never);
      expect(r).toBeTrue();
    });

    it('redirects when restore succeeds', async () => {
      isAuthenticated$.next(false);
      (authStore as any).tryRestoreSession = () => {
        isAuthenticated$.next(true);
        return of(undefined);
      };
      await firstValueFrom(run() as never);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/landing']);
    });
  });
});
