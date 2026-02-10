import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  distinctUntilChanged,
  map,
  of,
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

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly preferences = inject(PreferencesService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly userSubject$ = new BehaviorSubject<UserResponse | null>(
    null,
  );
  private readonly accessTokenSubject$ = new BehaviorSubject<string | null>(
    null,
  );
  private readonly loadingSubject$ = new BehaviorSubject<boolean>(false);
  private readonly errorSubject$ = new BehaviorSubject<string | null>(null);

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
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const raw = error.error?.error?.message;
          this.errorSubject$.next(
            this.translateError(raw, 'Identifiants incorrects'),
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
            this.translateError(raw, "Erreur lors de l'inscription"),
          );
          return throwError(() => error);
        }),
      );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http
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
        }),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        }),
      );
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
    return this.http
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
        }),
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
            this.translateError(
              raw,
              'Erreur lors de la demande de reinitialisation',
            ),
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
            this.translateError(
              raw,
              'Erreur lors de la reinitialisation du mot de passe',
            ),
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
            this.translateError(
              raw,
              "Erreur lors de la verification de l'email",
            ),
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

  private translateError(message: string, fallback: string): string {
    const map: Record<string, string> = {
      'Invalid credentials': 'Email ou mot de passe incorrect',
      'Invalid email or password': 'Email ou mot de passe incorrect',
      'Email not verified':
        'Veuillez verifier votre email avant de vous connecter',
      'Please verify your email before logging in':
        'Veuillez verifier votre email avant de vous connecter',
      'email must be an email': "L'adresse email n'est pas valide",
      'Email address is not valid': "L'adresse email n'est pas valide",
      'This email address is already in use':
        'Cette adresse email est deja utilisee',
      'Email already registered': 'Cette adresse email est deja utilisee',
      'Token expired': 'Le lien a expire, veuillez refaire une demande',
      'Invalid token': 'Lien invalide, veuillez refaire une demande',
      'Invalid or expired verification token':
        'Ce lien de verification est invalide ou a expire. Essayez de vous reconnecter pour recevoir un nouvel email.',
      'Invalid or expired reset token':
        'Ce lien de reinitialisation est invalide ou a expire. Veuillez refaire une demande.',
    };
    return map[message] || message || fallback;
  }
}
