import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map, take, switchMap, of, catchError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';

/**
 * Guard for protected routes (e.g. /dashboard).
 * Tries to restore the session via refresh-token if not already authenticated,
 * then checks authentication status.
 * Passes the attempted URL as returnUrl so the user is redirected back after login.
 */
export const authGuard: CanActivateFn = (_, state: RouterStateSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const buildLoginUrl = () =>
    router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });

  return authStore.isAuthenticated$.pipe(
    take(1),
    switchMap((isAuthenticated) => {
      if (isAuthenticated) {
        return of(true);
      }
      // Try to restore session before denying access
      return authStore.tryRestoreSession().pipe(
        switchMap(() => authStore.isAuthenticated$.pipe(take(1))),
        map((authenticated) => {
          if (authenticated) return true;
          return buildLoginUrl();
        }),
        catchError(() => of(buildLoginUrl())),
      );
    }),
  );
};

/**
 * Guard for guest-only routes (e.g. /auth/login, /auth/register).
 * Tries to restore session; if already authenticated, redirects to /dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.isAuthenticated$.pipe(
    take(1),
    switchMap((isAuthenticated) => {
      if (isAuthenticated) {
        return of(router.createUrlTree(['/landing']));
      }
      // Try to restore session — if it succeeds, redirect to landing
      return authStore.tryRestoreSession().pipe(
        switchMap(() => authStore.isAuthenticated$.pipe(take(1))),
        map((authenticated) => {
          if (authenticated) return router.createUrlTree(['/landing']);
          return true;
        }),
        catchError(() => of(true)),
      );
    }),
  );
};
