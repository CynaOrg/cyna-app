import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthStore } from '@core/stores/auth.store';
import { ForgotPasswordNativePage } from './forgot-password-native.page';

describe('ForgotPasswordNativePage', () => {
  let isLoading$: BehaviorSubject<boolean>;
  let error$: BehaviorSubject<string | null>;
  let authStore: jasmine.SpyObj<AuthStore>;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    isLoading$ = new BehaviorSubject<boolean>(false);
    error$ = new BehaviorSubject<string | null>(null);
    authStore = jasmine.createSpyObj<AuthStore>(
      'AuthStore',
      ['forgotPassword', 'clearError'],
      { isLoading$, error$ },
    );
    authStore.forgotPassword.and.returnValue(of({ message: 'ok' } as any));

    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordNativePage,
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ForgotPasswordNativePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not submit when email is invalid', () => {
    const fixture = TestBed.createComponent(ForgotPasswordNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ email: 'not-an-email' });
    fixture.componentInstance.onSubmit();
    expect(authStore.forgotPassword).not.toHaveBeenCalled();
  });

  it('submits and navigates to email-sent on success', async () => {
    const fixture = TestBed.createComponent(ForgotPasswordNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ email: 'foo@example.com' });
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
    expect(authStore.forgotPassword).toHaveBeenCalledWith({
      email: 'foo@example.com',
    });
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/m/auth/email-sent'],
      jasmine.any(Object),
    );
  });

  it('navigates to email-sent even on backend error (anti-enumeration)', async () => {
    authStore.forgotPassword.and.returnValue(
      throwError(() => new Error('boom')),
    );
    const fixture = TestBed.createComponent(ForgotPasswordNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ email: 'foo@example.com' });
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/m/auth/email-sent'],
      jasmine.any(Object),
    );
  });

  it('resets form on ionViewWillEnter', () => {
    const fixture = TestBed.createComponent(ForgotPasswordNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ email: 'foo@example.com' });
    fixture.componentInstance.ionViewWillEnter();
    expect(fixture.componentInstance.form.value.email).toBe('');
  });
});
