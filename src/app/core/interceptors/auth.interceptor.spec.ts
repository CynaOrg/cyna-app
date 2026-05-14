import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpRequest } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthStore } from '../stores/auth.store';
import { PreferencesService } from '../services/preferences.service';
import { environment } from '../../../environments/environment';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let authStore: jasmine.SpyObj<AuthStore>;
  let preferences: jasmine.SpyObj<PreferencesService>;
  let handler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    authStore = jasmine.createSpyObj(
      'AuthStore',
      ['refreshToken', 'clearSession'],
      { accessToken: 'jwt-1' },
    );
    preferences = jasmine.createSpyObj('PreferencesService', [
      'getOrCreateSessionId',
    ]);
    preferences.getOrCreateSessionId.and.resolveTo('session-abc');
    handler = jasmine.createSpyObj('HttpHandler', ['handle']);
    handler.handle.and.returnValue(of({}) as never);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        AuthInterceptor,
        { provide: AuthStore, useValue: authStore },
        { provide: PreferencesService, useValue: preferences },
      ],
    });
    interceptor = TestBed.inject(AuthInterceptor);
  });

  it('skips non-API requests', async () => {
    const req = new HttpRequest('GET', 'https://example.com/foo');
    await firstValueFrom(interceptor.intercept(req, handler));
    expect(preferences.getOrCreateSessionId).not.toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledWith(req);
  });

  it('attaches Authorization, session and lang headers on API requests', async () => {
    const req = new HttpRequest('GET', `${environment.apiUrl}/orders`);
    await firstValueFrom(interceptor.intercept(req, handler));
    const intercepted = handler.handle.calls.mostRecent().args[0];
    expect(intercepted.headers.get('Authorization')).toBe('Bearer jwt-1');
    expect(intercepted.headers.get('X-Session-Id')).toBe('session-abc');
    expect(intercepted.headers.get('Accept-Language')).toBeTruthy();
  });

  it('does not attach Authorization to auth endpoints', async () => {
    const req = new HttpRequest('POST', `${environment.apiUrl}/auth/login`, {});
    await firstValueFrom(interceptor.intercept(req, handler));
    const intercepted = handler.handle.calls.mostRecent().args[0];
    expect(intercepted.headers.get('Authorization')).toBeNull();
  });

  it('retries with refreshed token on 401', async () => {
    const req = new HttpRequest('GET', `${environment.apiUrl}/orders`);
    handler.handle.and.returnValues(
      throwError(() => ({ status: 401 })) as never,
      of({}) as never,
    );
    authStore.refreshToken.and.returnValue(
      of({ accessToken: 'jwt-2' }) as never,
    );
    await firstValueFrom(interceptor.intercept(req, handler));
    expect(authStore.refreshToken).toHaveBeenCalled();
    expect(handler.handle).toHaveBeenCalledTimes(2);
  });

  it('clears session when refresh fails', async () => {
    const req = new HttpRequest('GET', `${environment.apiUrl}/orders`);
    handler.handle.and.returnValue(
      throwError(() => ({ status: 401 })) as never,
    );
    authStore.refreshToken.and.returnValue(throwError(() => new Error('boom')));
    let caught = false;
    try {
      await firstValueFrom(interceptor.intercept(req, handler));
    } catch {
      caught = true;
    }
    expect(caught).toBeTrue();
    expect(authStore.clearSession).toHaveBeenCalled();
  });
});
