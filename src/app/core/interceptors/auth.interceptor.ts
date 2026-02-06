import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authStore = inject(AuthStore);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const isAuthEndpoint =
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/refresh-token') ||
      req.url.includes('/auth/forgot-password') ||
      req.url.includes('/auth/reset-password') ||
      req.url.includes('/auth/verify-email') ||
      req.url.includes('/auth/resend-verification');

    let authReq = req;
    const token = this.authStore.accessToken;

    if (token && !isAuthEndpoint) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !isAuthEndpoint) {
          return this.authStore.refreshToken().pipe(
            switchMap((response) => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`,
                },
              });
              return next.handle(retryReq);
            }),
            catchError((refreshError) => {
              this.authStore.clearSession();
              return throwError(() => refreshError);
            }),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
