import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  distinctUntilChanged,
  firstValueFrom,
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
  DeleteAccountRequest,
  DeleteAccountResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  ProfileUpdateResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateLanguageRequest,
  UpdateLanguageResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateProfileRequest,
  UserResponse,
} from '../interfaces/auth.interface';
import { isNativeCapacitor } from '../utils/platform.utils';
import { PreferencesService } from '../services/preferences.service';
import { TranslateService } from '@ngx-translate/core';
import { OrderStore } from './order.store';
import { SubscriptionStore } from './subscription.store';

/** Preferences key flagging that the user opted-in to biometric login. */
export const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
/** Preferences key for the biometric refresh token (MVP — see notes). */
export const BIOMETRIC_REFRESH_TOKEN_KEY = 'biometric_refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly preferences = inject(PreferencesService);
  private readonly translate = inject(TranslateService);
  private readonly orderStore = inject(OrderStore);
  private readonly subscriptionStore = inject(SubscriptionStore);
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
          this.applyUserLanguagePreference(authData.user);
          this.loadingSubject$.next(false);
          // Regenerate session_id after login so old guest session is discarded
          this.preferences.regenerateSessionId();
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.translateError(raw, 'AUTH.ERRORS.LOGIN_FALLBACK').then((msg) =>
            this.errorSubject$.next(msg),
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
          this.translateError(raw, 'AUTH.ERRORS.REGISTER_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
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
            this.setUser(authData.user);
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
    this.orderStore.clear();
    this.subscriptionStore.clear();
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
          this.translateError(raw, 'AUTH.ERRORS.FORGOT_PASSWORD_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
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
          this.translateError(raw, 'AUTH.ERRORS.RESET_PASSWORD_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
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
          this.translateError(raw, 'AUTH.ERRORS.VERIFY_EMAIL_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
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

  getProfile(): Observable<UserResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .get<ApiResponse<UserResponse>>(`${environment.apiUrl}/profile`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data),
        tap((user) => {
          this.setUser(user);
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.translateError(raw, 'PROFILE.ERRORS.LOAD_FALLBACK').then((msg) =>
            this.errorSubject$.next(msg),
          );
          return throwError(() => error);
        }),
      );
  }

  updateProfile(data: UpdateProfileRequest): Observable<ProfileUpdateResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .patch<ApiResponse<ProfileUpdateResponse>>(
        `${environment.apiUrl}/profile`,
        data,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.data),
        tap((result) => {
          this.setUser(result.user);
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.translateError(raw, 'PROFILE.ERRORS.UPDATE_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
          );
          return throwError(() => error);
        }),
      );
  }

  updatePassword(
    data: UpdatePasswordRequest,
  ): Observable<UpdatePasswordResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<ApiResponse<UpdatePasswordResponse>>(
        `${environment.apiUrl}/profile/password`,
        data,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.data),
        tap(() => {
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.translateError(raw, 'PROFILE.ERRORS.PASSWORD_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
          );
          return throwError(() => error);
        }),
      );
  }

  updateLanguage(
    data: UpdateLanguageRequest,
  ): Observable<UpdateLanguageResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .patch<ApiResponse<UpdateLanguageResponse>>(
        `${environment.apiUrl}/profile/language`,
        data,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.data),
        tap((result) => {
          this.applyUserLanguagePreference(result.user);
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.translateError(raw, 'PROFILE.ERRORS.LANGUAGE_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
          );
          return throwError(() => error);
        }),
      );
  }

  deleteAccount(data: DeleteAccountRequest): Observable<DeleteAccountResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<ApiResponse<DeleteAccountResponse>>(
        `${environment.apiUrl}/profile/delete`,
        data,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.data),
        tap(() => {
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.translateError(raw, 'PROFILE.ERRORS.DELETE_FALLBACK').then(
            (msg) => this.errorSubject$.next(msg),
          );
          return throwError(() => error);
        }),
      );
  }

  clearError(): void {
    this.errorSubject$.next(null);
  }

  // -------------------------------------------------------------------------
  // Biometric opt-in (B6)
  //
  // The refresh token is delivered as an HttpOnly cookie by the backend and
  // persists across native app launches via the Capacitor WebView storage.
  // For the MVP we therefore only persist:
  //  - a "biometric_enabled" flag (so the login page knows whether to render
  //    the biometric CTA)
  //  - a "biometric_refresh_token" placeholder (we keep the key for forward
  //    compatibility — if a future backend change exposes the refresh token
  //    in the response body, we can move it under this key without changing
  //    the surface).
  // The actual gating against an OS biometric prompt is handled by
  // `BiometricAuthService`. This store only owns persistence + the
  // `/auth/refresh-token` round-trip.
  // -------------------------------------------------------------------------

  /**
   * Mark biometric login as opt-in for this device. Optionally persists a
   * refresh token (no-op for the cookie-based flow but kept for symmetry).
   */
  async enableBiometric(refreshToken?: string): Promise<void> {
    await this.preferences.set(BIOMETRIC_ENABLED_KEY, '1');
    if (refreshToken) {
      await this.preferences.set(BIOMETRIC_REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /** Disable biometric login and wipe any stored token. */
  async disableBiometric(): Promise<void> {
    await this.preferences.remove(BIOMETRIC_ENABLED_KEY);
    await this.preferences.remove(BIOMETRIC_REFRESH_TOKEN_KEY);
  }

  /** True when the user has previously opted-in to biometric login. */
  async isBiometricEnabled(): Promise<boolean> {
    const value = await this.preferences.get<string>(BIOMETRIC_ENABLED_KEY);
    return value === '1';
  }

  /** Returns the persisted biometric refresh token, if any. */
  async getBiometricRefreshToken(): Promise<string | null> {
    return this.preferences.get<string>(BIOMETRIC_REFRESH_TOKEN_KEY);
  }

  /**
   * Restore a session via the persisted refresh-token cookie. Caller is
   * expected to have already triggered the OS biometric prompt and received
   * a positive result. Returns true on success, false otherwise.
   */
  async loginWithBiometric(): Promise<boolean> {
    try {
      await firstValueFrom(this.doRefresh());
      return true;
    } catch {
      return false;
    }
  }

  navigateAfterLogin(returnUrl?: string): void {
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }
    const target = isNativeCapacitor() ? '/home' : '/dashboard';
    this.router.navigate([target]);
  }

  private setUser(user: UserResponse): void {
    const preferredLanguage =
      String(user.preferredLanguage).toLowerCase() === 'en' ? 'en' : 'fr';
    this.userSubject$.next({ ...user, preferredLanguage });
  }

  private applyUserLanguagePreference(user: UserResponse): void {
    const preferredLanguage =
      String(user.preferredLanguage).toLowerCase() === 'en' ? 'en' : 'fr';
    this.userSubject$.next({ ...user, preferredLanguage });
    this.translate.use(preferredLanguage);
    document.cookie = `cyna_lang=${preferredLanguage};path=/;max-age=31536000;Secure;SameSite=Strict`;
  }

  private async translateError(
    message: string,
    fallbackKey: string,
  ): Promise<string> {
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
      'Current password is incorrect': 'PROFILE.ERRORS.WRONG_PASSWORD',
      'Invalid current password': 'PROFILE.ERRORS.WRONG_PASSWORD',
      'Password is incorrect': 'PROFILE.ERRORS.WRONG_PASSWORD',
    };
    const key = keyMap[message];
    if (key) return firstValueFrom(this.translate.get(key));
    if (message) return message;
    return firstValueFrom(this.translate.get(fallbackKey));
  }
}
