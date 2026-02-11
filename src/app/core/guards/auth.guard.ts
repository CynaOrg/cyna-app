import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, switchMap, of, catchError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';

/**
 * Guard for protected routes (e.g. /dashboard).
 * Tries to restore the session via refresh-token if not already authenticated,
 * then checks authentication status.
 */
export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

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
          return router.createUrlTree(['/auth/login']);
        }),
        catchError(() => of(router.createUrlTree(['/auth/login']))),
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
        return of(router.createUrlTree(['/dashboard']));
      }
      // Try to restore session — if it succeeds, redirect to dashboard
      return authStore.tryRestoreSession().pipe(
        switchMap(() => authStore.isAuthenticated$.pipe(take(1))),
        map((authenticated) => {
          if (authenticated) return router.createUrlTree(['/dashboard']);
          return true;
        }),
        catchError(() => of(true)),
      );
    }),
  );
};
