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
const REFRESH_TOKEN_KEY = 'refresh_token';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_PROMPT_DISMISSED_KEY = 'biometric_prompt_dismissed';
/**
 * Set on native after an *explicit* user logout (settings → Se déconnecter).
 * While this flag is 'true', `tryRestoreSession()` skips the auto-refresh so
 * the user stays signed out across app kill/relaunch — the refresh_token in
 * the Keychain is only re-used through the Face ID quick-login button.
 * Cleared on successful login or refresh.
 */
const LOGGED_OUT_KEY = 'logged_out';

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

  /**
   * Kept as a no-op for backward compatibility with the splash / login pages
   * that used to release the biometric gate. The gate has been removed:
   * persistence is now driven by the LOGGED_OUT_KEY flag, not by Face ID.
   */
  releaseBiometricGate(): void {
    // intentionally empty
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
          void this.persistRefreshToken(authData.refreshToken);
          // Successful login clears the explicit-logout marker so the user is
          // re-armed for auto-restore on subsequent app launches.
          void this.secureStorage.removeItem(LOGGED_OUT_KEY);
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

    // On native we read the refresh token from the Keychain and send it in the
    // body, because Capacitor iOS/Android cannot rely on the cross-origin
    // refresh-token cookie persisting across app launches. On web we send an
    // empty body and rely on the cookie via withCredentials.
    const buildBody$ = isNativeCapacitor()
      ? from(this.secureStorage.getItem(REFRESH_TOKEN_KEY)).pipe(
          switchMap((token) => {
            if (!token) {
              // No persisted token → can't refresh. Surface the same 401 shape
              // the API would return so the caller's catchError clears the
              // session consistently.
              return throwError(() => ({ status: 401 }));
            }
            return of({ refreshToken: token });
          }),
        )
      : of({});

    this.refreshInFlight$ = buildBody$.pipe(
      switchMap((body) =>
        this.http.post<ApiResponse<AuthResponse>>(
          `${this.apiUrl}/refresh-token`,
          body,
          { withCredentials: true },
        ),
      ),
      map((response) => response.data),
      tap((authData) => {
        this.accessTokenSubject$.next(authData.accessToken);
        void this.persistAccessToken(authData.accessToken);
        void this.persistRefreshToken(authData.refreshToken);
        // A successful refresh implies the user is authenticated again, so
        // drop the explicit-logout marker (covers the Face ID quick-login
        // path which goes through refreshToken()).
        void this.secureStorage.removeItem(LOGGED_OUT_KEY);
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

  /**
   * Explicit user logout (settings → Se déconnecter).
   *
   * On web: hit /logout to revoke the server-side refresh token, then hard
   * clear everything. The next visit requires a full password login.
   *
   * On native: do a *soft* logout — clear the in-memory session (and the
   * persisted access token) but keep the refresh_token + biometric opt-in
   * in the Keychain, and mark LOGGED_OUT_KEY=true. The user lands on
   * /auth/login where the Face ID quick-login button can refresh the
   * session without typing the password again. This matches the
   * Instagram-style UX: "log out" is a local action, not a server-side
   * revocation. Users who want to fully revoke their session can uninstall
   * the app or call logoutAndRevoke() explicitly.
   */
  logout(): void {
    if (isNativeCapacitor()) {
      void this.softLogoutNative();
      return;
    }
    this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession(),
      });
  }

  private async softLogoutNative(): Promise<void> {
    this.accessTokenSubject$.next(null);
    this.userSubject$.next(null);
    this.errorSubject$.next(null);
    this.orderStore.clear();
    this.subscriptionStore.clear();
    // Drop the in-memory access token but KEEP refresh_token and biometric
    // flags so the Face ID quick-login can rebuild the session.
    await this.secureStorage.removeItem(AUTH_TOKEN_KEY);
    await this.secureStorage.setItem(LOGGED_OUT_KEY, 'true');
    // Regenerate session_id so the next guest gets a fresh cart
    this.preferences.regenerateSessionId();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Hard clear: wipes every persisted credential including the refresh token
   * and biometric flags. Called when the refresh fails server-side (token
   * revoked / expired) — there is no point keeping stale flags around.
   */
  clearSession(): void {
    this.accessTokenSubject$.next(null);
    this.userSubject$.next(null);
    this.errorSubject$.next(null);
    this.orderStore.clear();
    this.subscriptionStore.clear();
    void this.secureStorage.removeItem(AUTH_TOKEN_KEY);
    void this.secureStorage.removeItem(REFRESH_TOKEN_KEY);
    void this.secureStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    void this.secureStorage.removeItem(BIOMETRIC_PROMPT_DISMISSED_KEY);
    void this.secureStorage.removeItem(LOGGED_OUT_KEY);
    this.preferences.regenerateSessionId();
    this.router.navigate(['/auth/login']);
  }

  tryRestoreSession(): Observable<void> {
    // On native, an explicit logout sets LOGGED_OUT_KEY in the Keychain. While
    // it is set, skip the auto-refresh so the user stays logged out across
    // app kill/relaunch — the refresh_token is preserved for the Face ID
    // quick-login button on /auth/login but is not used silently.
    return defer(() => from(this.isExplicitlyLoggedOut())).pipe(
      switchMap((loggedOut) => {
        if (loggedOut) {
          return of(undefined);
        }
        return this.doRefresh().pipe(
          map(() => undefined),
          catchError(() => of(undefined)),
        );
      }),
    );
  }

  private async isExplicitlyLoggedOut(): Promise<boolean> {
    if (!isNativeCapacitor()) return false;
    try {
      const flag = await this.secureStorage.getItem(LOGGED_OUT_KEY);
      return flag === 'true';
    } catch {
      return false;
    }
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
   * Persist the refresh token to the Keychain on native. This is the
   * cornerstone of "stay logged in across app launches" on iOS/Android: at
   * the next /refresh-token call, the app reads this token and sends it in
   * the body, bypassing the unreliable cross-origin cookie.
   *
   * On web, the API never returns the refresh token in the body (cookie
   * only) so `token` is always undefined here — no-op.
   */
  private async persistRefreshToken(token: string | undefined): Promise<void> {
    if (!token) return;
    try {
      await this.secureStorage.setItem(REFRESH_TOKEN_KEY, token);
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
