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
      ],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
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
});
