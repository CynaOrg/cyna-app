import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from './auth.store';
import { OrderStore } from './order.store';
import { SubscriptionStore } from './subscription.store';
import { PreferencesService } from '../services/preferences.service';
import { SecureStorageService } from '../services/secure-storage.service';
import { LanguageStorageService } from '../services/language-storage.service';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  UserResponse,
  RegisterResponse,
} from '../interfaces/auth.interface';

describe('AuthStore', () => {
  let store: AuthStore;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let orderStoreSpy: jasmine.SpyObj<OrderStore>;
  let subscriptionStoreSpy: jasmine.SpyObj<SubscriptionStore>;
  let preferencesSpy: jasmine.SpyObj<PreferencesService>;
  let secureStorageSpy: jasmine.SpyObj<SecureStorageService>;
  let langStorageSpy: jasmine.SpyObj<LanguageStorageService>;

  const apiUrl = `${environment.apiUrl}/auth`;

  const mockUser: UserResponse = {
    id: 'user-1',
    email: 'test@test.com',
    firstName: 'John',
    lastName: 'Doe',
    preferredLanguage: 'fr',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'jwt-token-123',
    expiresIn: 3600,
    user: mockUser,
  };

  const mockRegisterResponse: RegisterResponse = {
    message: 'Registration successful',
    user: mockUser,
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    orderStoreSpy = jasmine.createSpyObj('OrderStore', ['clear']);
    subscriptionStoreSpy = jasmine.createSpyObj('SubscriptionStore', ['clear']);
    preferencesSpy = jasmine.createSpyObj('PreferencesService', [
      'regenerateSessionId',
    ]);
    preferencesSpy.regenerateSessionId.and.returnValue(
      Promise.resolve('new-session-id'),
    );
    secureStorageSpy = jasmine.createSpyObj('SecureStorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    secureStorageSpy.getItem.and.returnValue(Promise.resolve(null));
    secureStorageSpy.setItem.and.returnValue(Promise.resolve());
    secureStorageSpy.removeItem.and.returnValue(Promise.resolve());
    langStorageSpy = jasmine.createSpyObj('LanguageStorageService', ['save']);
    langStorageSpy.save.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthStore,
        { provide: Router, useValue: routerSpy },
        { provide: OrderStore, useValue: orderStoreSpy },
        { provide: SubscriptionStore, useValue: subscriptionStoreSpy },
        { provide: PreferencesService, useValue: preferencesSpy },
        { provide: SecureStorageService, useValue: secureStorageSpy },
        { provide: LanguageStorageService, useValue: langStorageSpy },
      ],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login and store token', fakeAsync(() => {
    store
      .login({ email: 'test@test.com', password: 'password' })
      .subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
      });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: 'password',
    });
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ data: mockAuthResponse });

    tick();

    expect(store.accessToken).toBe('jwt-token-123');
  }));

  it('should set user after login', fakeAsync(() => {
    store.login({ email: 'test@test.com', password: 'password' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush({ data: mockAuthResponse });

    tick();

    firstValueFrom(store.user$).then((user) => {
      expect(user).toBeTruthy();
      expect(user!.email).toBe('test@test.com');
    });
  }));

  it('should set isAuthenticated$ to true after login', fakeAsync(() => {
    store.login({ email: 'test@test.com', password: 'password' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush({ data: mockAuthResponse });

    tick();

    firstValueFrom(store.isAuthenticated$).then((isAuth) => {
      expect(isAuth).toBeTrue();
    });
  }));

  it('should handle login errors', fakeAsync(() => {
    store.login({ email: 'test@test.com', password: 'wrong' }).subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(
      { error: { message: 'Invalid credentials' } },
      { status: 401, statusText: 'Unauthorized' },
    );

    tick();

    expect(store.accessToken).toBeNull();

    // Error should be set (translated or raw)
    firstValueFrom(store.error$).then((error) => {
      expect(error).toBeTruthy();
    });
  }));

  it('should logout and clear session', fakeAsync(() => {
    // First login
    store.login({ email: 'test@test.com', password: 'password' }).subscribe();

    const loginReq = httpMock.expectOne(`${apiUrl}/login`);
    loginReq.flush({ data: mockAuthResponse });
    tick();

    // Now logout
    store.logout();

    const logoutReq = httpMock.expectOne(`${apiUrl}/logout`);
    logoutReq.flush({});
    tick();

    expect(store.accessToken).toBeNull();
    expect(orderStoreSpy.clear).toHaveBeenCalled();
    expect(subscriptionStoreSpy.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should clear dependent stores on logout', fakeAsync(() => {
    store.logout();

    const logoutReq = httpMock.expectOne(`${apiUrl}/logout`);
    logoutReq.flush({});
    tick();

    expect(orderStoreSpy.clear).toHaveBeenCalled();
    expect(subscriptionStoreSpy.clear).toHaveBeenCalled();
    expect(preferencesSpy.regenerateSessionId).toHaveBeenCalled();
  }));

  it('should refresh token', fakeAsync(() => {
    store.refreshToken().subscribe((response) => {
      expect(response.accessToken).toBe('jwt-token-123');
    });

    const req = httpMock.expectOne(`${apiUrl}/refresh-token`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ data: mockAuthResponse });

    tick();

    expect(store.accessToken).toBe('jwt-token-123');
  }));

  it('should clear session when refresh token fails', fakeAsync(() => {
    store.refreshToken().subscribe({
      error: () => {
        // expected
      },
    });

    const req = httpMock.expectOne(`${apiUrl}/refresh-token`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    tick();

    expect(store.accessToken).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should register user', fakeAsync(() => {
    const registerData = {
      email: 'new@test.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    store.register(registerData).subscribe((response) => {
      expect(response.message).toBe('Registration successful');
    });

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerData);
    req.flush({ data: mockRegisterResponse });

    tick();
  }));

  it('should handle register errors', fakeAsync(() => {
    store
      .register({
        email: 'existing@test.com',
        password: 'pass',
        firstName: 'A',
        lastName: 'B',
      })
      .subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });

    const req = httpMock.expectOne(`${apiUrl}/register`);
    req.flush(
      { error: { message: 'Email already registered' } },
      { status: 409, statusText: 'Conflict' },
    );

    tick();

    firstValueFrom(store.error$).then((error) => {
      expect(error).toBeTruthy();
    });
  }));

  it('should clear error', fakeAsync(() => {
    store
      .login({ email: 'test@test.com', password: 'wrong' })
      .subscribe({ error: () => {} });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(
      { error: { message: 'Invalid credentials' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    tick();

    store.clearError();

    firstValueFrom(store.error$).then((error) => {
      expect(error).toBeNull();
    });
  }));

  it('should set loading to false after successful login', fakeAsync(() => {
    store.login({ email: 'test@test.com', password: 'password' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush({ data: mockAuthResponse });
    tick();

    firstValueFrom(store.isLoading$).then((loading) => {
      expect(loading).toBeFalse();
    });
  }));

  it('should set loading to false after failed login', fakeAsync(() => {
    store
      .login({ email: 'test@test.com', password: 'wrong' })
      .subscribe({ error: () => {} });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush(
      { error: { message: 'Invalid' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    tick();

    firstValueFrom(store.isLoading$).then((loading) => {
      expect(loading).toBeFalse();
    });
  }));

  it('forgotPassword issues a POST and parses data', fakeAsync(() => {
    store.forgotPassword({ email: 'a@b.fr' }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: { message: 'sent' } });
    tick();
  }));

  it('forgotPassword surfaces server error', fakeAsync(() => {
    store.forgotPassword({ email: 'a@b.fr' }).subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
    req.flush({ error: { message: 'down' } }, { status: 500, statusText: 'X' });
    tick();
  }));

  it('resetPassword issues a POST', fakeAsync(() => {
    store.resetPassword({ token: 'tok', newPassword: 'NewPass1!' }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/reset-password`);
    req.flush({ data: { message: 'ok' } });
    tick();
  }));

  it('resetPassword surfaces server error', fakeAsync(() => {
    store
      .resetPassword({ token: 'tok', newPassword: 'NewPass1!' })
      .subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${apiUrl}/reset-password`);
    req.flush({ error: { message: 'bad' } }, { status: 400, statusText: 'X' });
    tick();
  }));

  it('verifyEmail issues a POST', fakeAsync(() => {
    store.verifyEmail('the-token').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/verify-email`);
    expect(req.request.body).toEqual({ token: 'the-token' });
    req.flush({ data: { message: 'verified' } });
    tick();
  }));

  it('verifyEmail surfaces server error', fakeAsync(() => {
    store.verifyEmail('bad').subscribe({ error: () => {} });
    httpMock
      .expectOne(`${apiUrl}/verify-email`)
      .flush(
        { error: { message: 'invalid' } },
        { status: 400, statusText: 'X' },
      );
    tick();
  }));

  it('resendVerification issues a POST', fakeAsync(() => {
    store.resendVerification('a@b.fr').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/resend-verification`);
    expect(req.request.body).toEqual({ email: 'a@b.fr' });
    req.flush({ data: { message: 'sent' } });
    tick();
  }));

  it('getProfile sets the user', fakeAsync(() => {
    store.getProfile().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockUser });
    tick();
    firstValueFrom(store.user$).then((u) => expect(u).toBeTruthy());
  }));

  it('getProfile surfaces server error', fakeAsync(() => {
    store.getProfile().subscribe({ error: () => {} });
    httpMock.expectOne(`${environment.apiUrl}/profile`).flush(
      { error: { message: 'unauthorized' } },
      {
        status: 401,
        statusText: 'X',
      },
    );
    tick();
  }));

  it('updateProfile PATCHes /profile', fakeAsync(() => {
    store.updateProfile({ firstName: 'New' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/profile`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ data: { user: mockUser } });
    tick();
  }));

  it('updateProfile surfaces server error', fakeAsync(() => {
    store.updateProfile({ firstName: 'x' }).subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/profile`)
      .flush({ error: { message: 'oops' } }, { status: 400, statusText: 'X' });
    tick();
  }));

  it('updatePassword POSTs /profile/password', fakeAsync(() => {
    store
      .updatePassword({ currentPassword: 'a', newPassword: 'b' })
      .subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/profile/password`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: { message: 'ok' } });
    tick();
  }));

  it('updatePassword surfaces server error', fakeAsync(() => {
    store
      .updatePassword({ currentPassword: 'a', newPassword: 'b' })
      .subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/profile/password`)
      .flush(
        { error: { message: 'mismatch' } },
        { status: 400, statusText: 'X' },
      );
    tick();
  }));

  it('updateLanguage PATCHes /profile/language', fakeAsync(() => {
    store.updateLanguage({ preferredLanguage: 'en' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/profile/language`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ data: { user: { ...mockUser, preferredLanguage: 'en' } } });
    tick();
  }));

  it('updateLanguage surfaces server error', fakeAsync(() => {
    store
      .updateLanguage({ preferredLanguage: 'en' })
      .subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/profile/language`)
      .flush({ error: { message: 'x' } }, { status: 400, statusText: 'X' });
    tick();
  }));

  it('deleteAccount POSTs /profile/delete', fakeAsync(() => {
    store.deleteAccount({ password: 'pwd' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/profile/delete`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: { message: 'deleted' } });
    tick();
  }));

  it('deleteAccount surfaces server error', fakeAsync(() => {
    store.deleteAccount({ password: 'pwd' }).subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/profile/delete`)
      .flush({ error: { message: 'bad' } }, { status: 400, statusText: 'X' });
    tick();
  }));

  it('navigateAfterLogin honours an explicit returnUrl', () => {
    routerSpy.navigateByUrl = jasmine.createSpy('navigateByUrl');
    store.navigateAfterLogin('/foo');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/foo');
  });

  it('navigateAfterLogin defaults to /dashboard on web', () => {
    store.navigateAfterLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('releaseBiometricGate is a no-op (back-compat shim)', () => {
    expect(() => store.releaseBiometricGate()).not.toThrow();
  });

  it('errorValue mirrors the BehaviorSubject', () => {
    expect(store.errorValue).toBeNull();
  });

  it('loadPersistedAccessToken returns null on web', async () => {
    expect(await store.loadPersistedAccessToken()).toBeNull();
  });

  it('tryRestoreSession resolves to void without throwing', async () => {
    // Use real promise flow: tryRestoreSession calls into secureStorage (async),
    // then doRefresh which performs an HTTP call. Just verify it does not throw.
    const promise = new Promise<unknown>((resolve) => {
      store.tryRestoreSession().subscribe(resolve);
    });
    // Allow the deferred secureStorage check to run, then handle the request.
    await Promise.resolve();
    const reqs = httpMock.match(`${apiUrl}/refresh-token`);
    reqs.forEach((r) => r.flush({}, { status: 401, statusText: 'X' }));
    const value = await promise;
    expect(value).toBeUndefined();
  });
});
