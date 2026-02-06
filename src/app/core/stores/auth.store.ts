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
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
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

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.accessTokenSubject$.next(response.accessToken);
          this.userSubject$.next(response.user);
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const message = error.error?.message || 'Identifiants incorrects';
          this.errorSubject$.next(message);
          return throwError(() => error);
        }),
      );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(() => {
          this.loadingSubject$.next(false);
        }),
        catchError((error) => {
          this.loadingSubject$.next(false);
          const message =
            error.error?.message || "Erreur lors de l'inscription";
          this.errorSubject$.next(message);
          return throwError(() => error);
        }),
      );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/refresh-token`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          this.accessTokenSubject$.next(response.accessToken);
          if (response.user) {
            this.userSubject$.next(response.user);
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
      .post<AuthResponse>(
        `${this.apiUrl}/refresh-token`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          this.accessTokenSubject$.next(response.accessToken);
          if (response.user) {
            this.userSubject$.next(response.user);
          }
        }),
        map(() => undefined),
        catchError(() => of(undefined)),
      );
  }

  clearError(): void {
    this.errorSubject$.next(null);
  }

  navigateAfterLogin(): void {
    const target = isNativeCapacitor() ? '/home' : '/landing';
    this.router.navigate([target]);
  }
}
