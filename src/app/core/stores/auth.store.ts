import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  defer,
  distinctUntilChanged,
  firstValueFrom,
  from,
  map,
  of,
  shareReplay,
  switchMap,
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
import { SecureStorageService } from '../services/secure-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { OrderStore } from './order.store';
import { SubscriptionStore } from './subscription.store';

const AUTH_TOKEN_KEY = 'auth_token';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly preferences = inject(PreferencesService);
  private readonly secureStorage = inject(SecureStorageService);
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

  /**
   * Native biometric gate. When true, session restoration via the refresh-token
   * cookie is blocked until the user successfully passes biometric auth (or
   * re-authenticates with password). This prevents a third party borrowing the
   * phone from bypassing Face ID via the persistent server-side cookie.
   *
   * Initialized asynchronously at construction by reading `biometric_enabled`
   * from secure storage. Callers that need to wait for a deterministic gate
   * value (notably APP_INITIALIZER) should await `gateInitialized`.
   */
  private biometricGatePending = false;
  private readonly gateInitialized: Promise<void>;

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

  constructor() {
    this.gateInitialized = this.initBiometricGate();
  }

  /**
   * Read `biometric_enabled` from secure storage and arm the gate before any
   * session restoration runs. On native, if biometric quick-login is enabled,
   * we block `tryRestoreSession()` until either:
   *   - the splash biometric prompt succeeds → `releaseBiometricGate()`
   *   - the user re-authenticates via `login()` → `releaseBiometricGate()`
   * On web, the gate is never armed.
   */
  private async initBiometricGate(): Promise<void> {
    if (!isNativeCapacitor()) {
      this.biometricGatePending = false;
      return;
    }
    try {
      const enabled = await this.secureStorage.getItem(BIOMETRIC_ENABLED_KEY);
      this.biometricGatePending = enabled === 'true';
    } catch {
      // Defensive: never trap the user. If storage fails, leave the gate open
      // (the user can always re-login normally).
      this.biometricGatePending = false;
    }
  }

  /**
   * Release the biometric gate. Called by the splash on successful biometric
   * authentication, and by `login()` when the user re-authenticates.
   */
  releaseBiometricGate(): void {
    this.biometricGatePending = false;
  }

  /**
   * True while the native biometric gate is armed and pending validation.
   * Used to block silent session restoration via the refresh-token cookie.
   */
  get isBiometricGatePending(): boolean {
    return this.biometricGatePending;
  }

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
          void this.persistAccessToken(authData.accessToken);
          this.applyUserLanguagePreference(authData.user);
          this.loadingSubject$.next(false);
          // Re-authentication via password legitimately bypasses the biometric
          // gate (e.g. after a Face ID cancel/non-match earlier).
          this.releaseBiometricGate();
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
          void this.persistAccessToken(authData.accessToken);
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
    // Drop the persisted access token so the next launch does not auto-restore.
    void this.secureStorage.removeItem(AUTH_TOKEN_KEY);
    // Lifting the biometric gate on logout so a subsequent in-session login
    // is not blocked. The next app launch re-arms the gate from storage.
    this.releaseBiometricGate();
    // Regenerate session_id on logout so the next guest gets a fresh cart
    this.preferences.regenerateSessionId();
    this.router.navigate(['/auth/login']);
  }

  tryRestoreSession(): Observable<void> {
    // Wait for biometric gate initialization to complete before deciding
    // whether to hit the refresh-token endpoint. This avoids a race where the
    // cookie-based session would be silently restored before the splash had a
    // chance to enforce Face ID / Touch ID.
    return defer(() => from(this.gateInitialized)).pipe(
      switchMap(() => {
        if (this.biometricGatePending) {
          // Gate armed: the splash will either release the gate on biometric
          // success (and re-call this method) or redirect to /auth/login.
          // eslint-disable-next-line no-console
          console.log(
            '[AUTH] tryRestoreSession blocked: biometric gate pending',
          );
          return of(undefined);
        }
        return this.doRefresh().pipe(
          map(() => undefined),
          catchError(() => of(undefined)),
        );
      }),
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

  navigateAfterLogin(returnUrl?: string): void {
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }
    const target = isNativeCapacitor() ? '/home' : '/dashboard';
    this.router.navigate([target]);
  }

  /**
   * Persist the access token to secure storage on native (Keychain) so it can
   * be restored at app launch — for example to gate the biometric flow.
   * Best-effort: errors are swallowed to never break login.
   */
  private async persistAccessToken(token: string): Promise<void> {
    try {
      await this.secureStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // ignore: persistence is best-effort
    }
  }

  /**
   * Read any token previously persisted in SecureStorage (with soft migration
   * from Preferences). The HTTP refresh-token cookie remains the source of
   * truth for re-authentication; this token is mostly used by gating logic
   * such as the biometric flow.
   */
  async loadPersistedAccessToken(): Promise<string | null> {
    try {
      return await this.secureStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
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
