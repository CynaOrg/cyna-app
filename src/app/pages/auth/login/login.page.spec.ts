import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { LoginPage } from './login.page';
import { AuthStore } from '@core/stores/auth.store';
import { CartStore } from '@core/stores/cart.store';
import { BiometricAuthService } from '@core/native';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { ResendEmailComponent } from '@shared/components/resend-email/resend-email.component';
import { CynaLogoComponent } from '@shared/components/cyna-logo/cyna-logo.component';
import { HapticOnDirective } from '@shared/directives';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let biometricSpy: jasmine.SpyObj<BiometricAuthService>;
  let authStoreSpy: jasmine.SpyObj<AuthStore> & {
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
  };
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    biometricSpy = jasmine.createSpyObj<BiometricAuthService>(
      'BiometricAuthService',
      ['isAvailable', 'authenticate', 'getBiometryType'],
    );
    biometricSpy.isAvailable.and.resolveTo(false);
    biometricSpy.getBiometryType.and.resolveTo('none');
    biometricSpy.authenticate.and.resolveTo(false);

    const baseStore = jasmine.createSpyObj<AuthStore>(
      'AuthStore',
      [
        'login',
        'clearError',
        'navigateAfterLogin',
        'isBiometricEnabled',
        'enableBiometric',
        'disableBiometric',
        'loginWithBiometric',
      ],
    );
    authStoreSpy = baseStore as typeof authStoreSpy;
    authStoreSpy.isLoading$ = new BehaviorSubject<boolean>(false);
    authStoreSpy.error$ = new BehaviorSubject<string | null>(null);
    (authStoreSpy as unknown as { isAuthenticated$: BehaviorSubject<boolean> })
      .isAuthenticated$ = new BehaviorSubject<boolean>(false);
    authStoreSpy.isBiometricEnabled.and.resolveTo(false);
    authStoreSpy.enableBiometric.and.resolveTo();
    authStoreSpy.disableBiometric.and.resolveTo();
    authStoreSpy.loginWithBiometric.and.resolveTo(true);

    alertCtrlSpy = jasmine.createSpyObj<AlertController>('AlertController', [
      'create',
    ]);

    const cartStoreStub = {
      cart$: new BehaviorSubject(null),
      items$: new BehaviorSubject<unknown[]>([]),
      count$: new BehaviorSubject(0),
      total$: new BehaviorSubject(0),
      isEmpty$: new BehaviorSubject(true),
      isLoading$: new BehaviorSubject(false),
      error$: new BehaviorSubject<string | null>(null),
      loadCart: jasmine.createSpy('loadCart'),
    };

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        InputComponent,
        ButtonComponent,
        BrowserHeaderComponent,
        ResendEmailComponent,
        CynaLogoComponent,
        HapticOnDirective,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: authStoreSpy },
        { provide: CartStore, useValue: cartStoreStub },
        { provide: BiometricAuthService, useValue: biometricSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('hides biometric CTA by default', () => {
    fixture.detectChanges();
    expect(component.showBiometricLogin()).toBeFalse();
  });

  it('shows biometric CTA when available + opted-in', fakeAsync(() => {
    biometricSpy.isAvailable.and.resolveTo(true);
    biometricSpy.getBiometryType.and.resolveTo('faceId');
    authStoreSpy.isBiometricEnabled.and.resolveTo(true);

    fixture.detectChanges();
    tick();

    expect(component.showBiometricLogin()).toBeTrue();
    expect(component.biometryKind()).toBe('faceId');
  }));

  it('hides biometric CTA when available but NOT opted-in', fakeAsync(() => {
    biometricSpy.isAvailable.and.resolveTo(true);
    authStoreSpy.isBiometricEnabled.and.resolveTo(false);

    fixture.detectChanges();
    tick();

    expect(component.showBiometricLogin()).toBeFalse();
  }));

  describe('loginWithBiometric()', () => {
    it('navigates after a successful biometric login', fakeAsync(() => {
      biometricSpy.authenticate.and.resolveTo(true);
      authStoreSpy.loginWithBiometric.and.resolveTo(true);

      fixture.detectChanges();
      void component.loginWithBiometric();
      tick();

      expect(biometricSpy.authenticate).toHaveBeenCalled();
      expect(authStoreSpy.loginWithBiometric).toHaveBeenCalled();
      expect(authStoreSpy.navigateAfterLogin).toHaveBeenCalled();
    }));

    it('does nothing when biometric prompt is cancelled', fakeAsync(() => {
      biometricSpy.authenticate.and.resolveTo(false);

      fixture.detectChanges();
      void component.loginWithBiometric();
      tick();

      expect(authStoreSpy.loginWithBiometric).not.toHaveBeenCalled();
      expect(authStoreSpy.navigateAfterLogin).not.toHaveBeenCalled();
    }));

    it('disables biometric opt-in when refresh-token call fails', fakeAsync(() => {
      biometricSpy.authenticate.and.resolveTo(true);
      authStoreSpy.loginWithBiometric.and.resolveTo(false);

      fixture.detectChanges();
      // Pretend the CTA was visible.
      component.showBiometricLogin.set(true);

      void component.loginWithBiometric();
      tick();

      expect(authStoreSpy.disableBiometric).toHaveBeenCalled();
      expect(component.showBiometricLogin()).toBeFalse();
      expect(authStoreSpy.navigateAfterLogin).not.toHaveBeenCalled();
    }));
  });

  describe('biometryLabel()', () => {
    // TranslateModule.forRoot() in tests has no loader so it returns the key
    // verbatim — that's enough to verify branching logic without coupling
    // tests to the i18n bundles.
    it('uses FACE_ID key for faceId kind', () => {
      fixture.detectChanges();
      component.biometryKind.set('faceId');
      expect(component.biometryLabel()).toBe('AUTH.BIOMETRIC.FACE_ID');
    });

    it('uses TOUCH_ID key for touchId kind', () => {
      fixture.detectChanges();
      component.biometryKind.set('touchId');
      expect(component.biometryLabel()).toBe('AUTH.BIOMETRIC.TOUCH_ID');
    });

    it('uses FINGERPRINT key for fingerprint kind', () => {
      fixture.detectChanges();
      component.biometryKind.set('fingerprint');
      expect(component.biometryLabel()).toBe('AUTH.BIOMETRIC.FINGERPRINT');
    });

    it('falls back to AUTH.BIOMETRIC.FALLBACK key for none', () => {
      fixture.detectChanges();
      component.biometryKind.set('none');
      expect(component.biometryLabel()).toBe('AUTH.BIOMETRIC.FALLBACK');
    });
  });
});
