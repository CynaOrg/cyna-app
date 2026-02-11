import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserResponse,
} from '../interfaces/auth.interface';
import { isNativeCapacitor } from '../utils/platform.utils';
import { PreferencesService } from '../services/preferences.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly preferences = inject(PreferencesService);
  private readonly translate = inject(TranslateService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly userSubject$ = new BehaviorSubject<UserResponse | null>(
    null,
  );
  private readonly accessTokenSubject$ = new BehaviorSubject<string | null>(
    null,
  );
  private readonly loadingSubject$ = new BehaviorSubject<boolean>(false);
  private readonly errorSubject$ = new BehaviorSubject<string | null>(null);
  private refreshInFlight$: Observable<AuthResponse> | null = null;

  readonly user$ = this.userSubject$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly isAuthenticated$ = this.userSubject$.pipe(
    map((u) => !!u),
    distinctUntilChanged(),
  );
  readonly isLoading$ = this.loadingSubject$
    .asObservable()
    .pipe(distinctUntilChanged());
  readonly error$ = this.errorSubject$
    .asObservable()
    .pipe(distinctUntilChanged());

  get accessToken(): string | null {
    return this.accessTokenSubject$.getValue();
  }

  get errorValue(): string | null {
    return this.errorSubject$.getValue();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data),
        tap((authData) => {
          this.accessTokenSubject$.next(authData.accessToken);
          this.userSubject$.next(authData.user);
          this.loadingSubject$.next(false);
          // Regenerate session_id after login so old guest session is discarded
          this.preferences.regenerateSessionId();
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.errorSubject$.next(
            this.translateError(raw, 'AUTH.ERRORS.LOGIN_FALLBACK'),
          );
          return throwError(() => error);
        }),
      );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<ApiResponse<RegisterResponse>>(`${this.apiUrl}/register`, data)
      .pipe(
        map((response) => response.data),
        tap(() => {
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.errorSubject$.next(
            this.translateError(raw, 'AUTH.ERRORS.REGISTER_FALLBACK'),
          );
          return throwError(() => error);
        }),
      );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.doRefresh().pipe(
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
    );
  }

  private doRefresh(): Observable<AuthResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    this.refreshInFlight$ = this.http
      .post<
        ApiResponse<AuthResponse>
      >(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((response) => response.data),
        tap((authData) => {
          this.accessTokenSubject$.next(authData.accessToken);
          if (authData.user) {
            this.userSubject$.next(authData.user);
          }
          this.refreshInFlight$ = null;
        }),
        catchError((error) => {
          this.refreshInFlight$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
      );

    return this.refreshInFlight$;
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession(),
      });
  }

  clearSession(): void {
    this.accessTokenSubject$.next(null);
    this.userSubject$.next(null);
    this.errorSubject$.next(null);
    // Regenerate session_id on logout so the next guest gets a fresh cart
    this.preferences.regenerateSessionId();
    this.router.navigate(['/auth/login']);
  }

  tryRestoreSession(): Observable<void> {
    return this.doRefresh().pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
    );
  }

  forgotPassword(
    data: ForgotPasswordRequest,
  ): Observable<ForgotPasswordResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<
        ApiResponse<ForgotPasswordResponse>
      >(`${this.apiUrl}/forgot-password`, data)
      .pipe(
        map((response) => response.data),
        tap(() => {
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.errorSubject$.next(
            this.translateError(raw, 'AUTH.ERRORS.FORGOT_PASSWORD_FALLBACK'),
          );
          return throwError(() => error);
        }),
      );
  }

  resetPassword(data: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<
        ApiResponse<ResetPasswordResponse>
      >(`${this.apiUrl}/reset-password`, data)
      .pipe(
        map((response) => response.data),
        tap(() => {
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.errorSubject$.next(
            this.translateError(raw, 'AUTH.ERRORS.RESET_PASSWORD_FALLBACK'),
          );
          return throwError(() => error);
        }),
      );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<ApiResponse<{ message: string }>>(`${this.apiUrl}/verify-email`, {
        token,
      })
      .pipe(
        map((response) => response.data),
        tap(() => {
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.errorSubject$.next(
            this.translateError(raw, 'AUTH.ERRORS.VERIFY_EMAIL_FALLBACK'),
          );
          return throwError(() => error);
        }),
      );
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http
      .post<
        ApiResponse<{ message: string }>
      >(`${this.apiUrl}/resend-verification`, { email })
      .pipe(map((response) => response.data));
  }

  clearError(): void {
    this.errorSubject$.next(null);
  }

  navigateAfterLogin(): void {
    const target = isNativeCapacitor() ? '/home' : '/landing';
    this.router.navigate([target]);
  }

  private translateError(message: string, fallbackKey: string): string {
    const keyMap: Record<string, string> = {
      'Invalid credentials': 'AUTH.ERRORS.INVALID_CREDENTIALS',
      'Invalid email or password': 'AUTH.ERRORS.INVALID_CREDENTIALS',
      'Email not verified': 'AUTH.ERRORS.EMAIL_NOT_VERIFIED',
      'Please verify your email before logging in':
        'AUTH.ERRORS.EMAIL_NOT_VERIFIED',
      'email must be an email': 'AUTH.ERRORS.INVALID_EMAIL',
      'Email address is not valid': 'AUTH.ERRORS.INVALID_EMAIL',
      'This email address is already in use': 'AUTH.ERRORS.EMAIL_ALREADY_USED',
      'Email already registered': 'AUTH.ERRORS.EMAIL_ALREADY_USED',
      'Token expired': 'AUTH.ERRORS.TOKEN_EXPIRED',
      'Invalid token': 'AUTH.ERRORS.INVALID_TOKEN',
      'Invalid or expired verification token':
        'AUTH.ERRORS.INVALID_VERIFICATION_TOKEN',
      'Invalid or expired reset token': 'AUTH.ERRORS.INVALID_RESET_TOKEN',
    };
    const key = keyMap[message];
    if (key) return this.translate.instant(key);
    if (message) return message;
    return this.translate.instant(fallbackKey);
  }
}
