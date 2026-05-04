import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { BiometryType } from '@aparajita/capacitor-biometric-auth';
import { AuthStore } from '@core/stores/auth.store';
import { PreferencesService } from '@core/services/preferences.service';
import { BiometricService } from '../../../services/biometric.service';
import { LoginNativePage } from './login-native.page';

describe('LoginNativePage', () => {
  let isLoading$: BehaviorSubject<boolean>;
  let error$: BehaviorSubject<string | null>;
  let authStore: jasmine.SpyObj<AuthStore>;
  let biometric: jasmine.SpyObj<BiometricService>;
  let preferences: jasmine.SpyObj<PreferencesService>;
  let alertCtrl: jasmine.SpyObj<AlertController>;
  let alertInstance: { present: jasmine.Spy; dismiss?: jasmine.Spy };

  beforeEach(async () => {
    isLoading$ = new BehaviorSubject<boolean>(false);
    error$ = new BehaviorSubject<string | null>(null);

    authStore = jasmine.createSpyObj<AuthStore>(
      'AuthStore',
      ['login', 'refreshToken', 'clearError', 'navigateAfterLogin'],
      {
        isLoading$,
        error$,
      },
    );
    authStore.login.and.returnValue(of({ accessToken: 'tok' } as any));
    authStore.refreshToken.and.returnValue(of({ accessToken: 'tok' } as any));

    biometric = jasmine.createSpyObj<BiometricService>('BiometricService', [
      'isAvailable',
      'getBiometryType',
      'authenticate',
    ]);
    biometric.isAvailable.and.resolveTo(false);
    biometric.getBiometryType.and.resolveTo(BiometryType.none);
    biometric.authenticate.and.resolveTo(true);

    preferences = jasmine.createSpyObj<PreferencesService>(
      'PreferencesService',
      ['get', 'set', 'remove'],
    );
    preferences.get.and.resolveTo(null);
    preferences.set.and.resolveTo();
    preferences.remove.and.resolveTo();

    alertInstance = {
      present: jasmine.createSpy('present').and.resolveTo(),
    };
    alertCtrl = jasmine.createSpyObj<AlertController>('AlertController', [
      'create',
    ]);
    alertCtrl.create.and.resolveTo(alertInstance as any);

    await TestBed.configureTestingModule({
      imports: [
        LoginNativePage,
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: BiometricService, useValue: biometric },
        { provide: PreferencesService, useValue: preferences },
        { provide: AlertController, useValue: alertCtrl },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginNativePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hides biometric login when device is not biometric-capable', async () => {
    biometric.isAvailable.and.resolveTo(false);
    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.showBiometricLogin()).toBe(false);
  });

  it('shows biometric login when capable and user has opted in', async () => {
    biometric.isAvailable.and.resolveTo(true);
    biometric.getBiometryType.and.resolveTo(BiometryType.faceId);
    preferences.get.and.resolveTo(true);

    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenStable();

    expect(fixture.componentInstance.showBiometricLogin()).toBe(true);
    expect(fixture.componentInstance.biometryLabel()).toBe('Face ID');
  });

  it('does not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    fixture.componentInstance.onSubmit();
    expect(authStore.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates after success when no biometry available', async () => {
    biometric.isAvailable.and.resolveTo(false);
    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      email: 'foo@example.com',
      password: 'pw1',
    });
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
    await fixture.whenStable();

    expect(authStore.login).toHaveBeenCalledWith({
      email: 'foo@example.com',
      password: 'pw1',
    });
    expect(authStore.navigateAfterLogin).toHaveBeenCalled();
  });

  it('prompts biometric opt-in alert after successful login on capable device', async () => {
    biometric.isAvailable.and.resolveTo(true);
    biometric.getBiometryType.and.resolveTo(BiometryType.faceId);
    preferences.get.and.resolveTo(null);

    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.form.setValue({
      email: 'foo@example.com',
      password: 'pw1',
    });
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
    await fixture.whenStable();

    expect(alertCtrl.create).toHaveBeenCalled();
    expect(alertInstance.present).toHaveBeenCalled();
  });

  it('does not re-prompt opt-in once a choice has been recorded', async () => {
    biometric.isAvailable.and.resolveTo(true);
    preferences.get.and.resolveTo(false); // user previously declined

    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.form.setValue({
      email: 'foo@example.com',
      password: 'pw1',
    });
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
    await fixture.whenStable();

    expect(alertCtrl.create).not.toHaveBeenCalled();
    expect(authStore.navigateAfterLogin).toHaveBeenCalled();
  });

  it('calls authStore.refreshToken when biometric quick-login succeeds', async () => {
    biometric.isAvailable.and.resolveTo(true);
    biometric.authenticate.and.resolveTo(true);
    preferences.get.and.resolveTo(true);

    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    await fixture.whenStable();

    await fixture.componentInstance.onBiometricLogin();
    await fixture.whenStable();

    expect(biometric.authenticate).toHaveBeenCalled();
    expect(authStore.refreshToken).toHaveBeenCalled();
    expect(authStore.navigateAfterLogin).toHaveBeenCalled();
  });

  it('skips refresh when biometric prompt fails or is cancelled', async () => {
    biometric.isAvailable.and.resolveTo(true);
    biometric.authenticate.and.resolveTo(false);
    preferences.get.and.resolveTo(true);

    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    await fixture.whenStable();

    await fixture.componentInstance.onBiometricLogin();

    expect(authStore.refreshToken).not.toHaveBeenCalled();
  });

  it('clears opt-in when refresh-token fails on quick-login', async () => {
    biometric.isAvailable.and.resolveTo(true);
    biometric.authenticate.and.resolveTo(true);
    preferences.get.and.resolveTo(true);
    authStore.refreshToken.and.returnValue(throwError(() => new Error('exp')));

    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    await fixture.whenStable();

    await fixture.componentInstance.onBiometricLogin();
    await fixture.whenStable();

    expect(preferences.remove).toHaveBeenCalledWith('biometric_enabled');
    expect(fixture.componentInstance.showBiometricLogin()).toBe(false);
  });

  it('resets form and error state on ionViewWillEnter', () => {
    const fixture = TestBed.createComponent(LoginNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({
      email: 'x@y.z',
      password: 'pw',
    });
    fixture.componentInstance.errorMessage = 'oops';
    fixture.componentInstance.ionViewWillEnter();
    expect(fixture.componentInstance.form.value.email).toBe('');
    expect(fixture.componentInstance.form.value.password).toBe('');
    expect(fixture.componentInstance.errorMessage).toBeNull();
  });
});
