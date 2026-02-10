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

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
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
          const message =
            error.error?.error?.message || 'Identifiants incorrects';
          this.errorSubject$.next(message);
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
          const message =
            error.error?.error?.message || "Erreur lors de l'inscription";
          this.errorSubject$.next(message);
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
          const message =
            error.error?.error?.message ||
            'Erreur lors de la demande de reinitialisation';
          this.errorSubject$.next(message);
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
          const message =
            error.error?.error?.message ||
            'Erreur lors de la reinitialisation du mot de passe';
          this.errorSubject$.next(message);
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
          const message =
            error.error?.error?.message ||
            "Erreur lors de la verification de l'email";
          this.errorSubject$.next(message);
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
}
