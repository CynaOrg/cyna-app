import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { PreferencesService } from '../services/preferences.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authStore = inject(AuthStore);
  private readonly preferences = inject(PreferencesService);

  private cachedSessionId: string | null = null;

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

    // Get session ID (cached or from preferences) then attach headers
    return from(this.getSessionId()).pipe(
      switchMap((sessionId) => {
        let headers: Record<string, string> = {
          'Accept-Language': 'fr',
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
            if (error.status === 401 && !isAuthEndpoint) {
              return this.authStore.refreshToken().pipe(
                switchMap((response) => {
                  const retryHeaders: Record<string, string> = {
                    Authorization: `Bearer ${response.accessToken}`,
                    'Accept-Language': 'fr',
                  };
                  if (sessionId) {
                    retryHeaders['X-Session-Id'] = sessionId;
                  }
                  const retryReq = req.clone({ setHeaders: retryHeaders });
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
      }),
    );
  }

  private async getSessionId(): Promise<string> {
    if (this.cachedSessionId) return this.cachedSessionId;
    this.cachedSessionId = await this.preferences.getOrCreateSessionId();
    return this.cachedSessionId;
  }
}
