import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthStore } from '../stores/auth.store';
import { PreferencesService } from '../services/preferences.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authStore = inject(AuthStore);
  private readonly preferences = inject(PreferencesService);
  private readonly translate = inject(TranslateService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const isApiRequest = req.url.startsWith(environment.apiUrl);

    const isAuthEndpoint =
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/refresh-token') ||
      req.url.includes('/auth/forgot-password') ||
      req.url.includes('/auth/reset-password') ||
      req.url.includes('/auth/verify-email') ||
      req.url.includes('/auth/resend-verification');

    // For non-API requests, pass through
    if (!isApiRequest) {
      return next.handle(req);
    }

    // Get session ID from PreferencesService (which handles its own caching)
    return from(this.preferences.getOrCreateSessionId()).pipe(
      switchMap((sessionId) => {
        const lang =
          this.translate.currentLang || this.translate.defaultLang || 'fr';
        let headers: Record<string, string> = {
          'Accept-Language': lang,
          'x-lang': lang,
        };

        const token = this.authStore.accessToken;
        if (token && !isAuthEndpoint) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (sessionId) {
          headers['X-Session-Id'] = sessionId;
        }

        const authReq = req.clone({ setHeaders: headers });

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            // Only attempt refresh if we had a token (user was logged in) and got 401
            if (error.status === 401 && !isAuthEndpoint && token) {
              return this.authStore.refreshToken().pipe(
                catchError((refreshError) => {
                  this.authStore.clearSession();
                  return throwError(() => refreshError);
                }),
                switchMap((response) => {
                  const retryHeaders: Record<string, string> = {
                    Authorization: `Bearer ${response.accessToken}`,
                    'Accept-Language': lang,
                    'x-lang': lang,
                  };
                  if (sessionId) {
                    retryHeaders['X-Session-Id'] = sessionId;
                  }
                  const retryReq = req.clone({ setHeaders: retryHeaders });
                  return next.handle(retryReq);
                }),
              );
            }
            return throwError(() => error);
          }),
        );
      }),
    );
  }
}
