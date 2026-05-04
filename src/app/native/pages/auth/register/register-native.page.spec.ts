import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

import { AuthStore } from '@core/stores/auth.store';
import { RegisterNativePage } from './register-native.page';

describe('RegisterNativePage', () => {
  let isLoading$: BehaviorSubject<boolean>;
  let error$: BehaviorSubject<string | null>;
  let authStore: jasmine.SpyObj<AuthStore>;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    isLoading$ = new BehaviorSubject<boolean>(false);
    error$ = new BehaviorSubject<string | null>(null);
    authStore = jasmine.createSpyObj<AuthStore>(
      'AuthStore',
      ['register', 'clearError'],
      { isLoading$, error$ },
    );
    authStore.register.and.returnValue(
      of({ user: { id: '1' } } as any),
    );

    await TestBed.configureTestingModule({
      imports: [
        RegisterNativePage,
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
    const fixture = TestBed.createComponent(RegisterNativePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(RegisterNativePage);
    fixture.detectChanges();
    fixture.componentInstance.onSubmit();
    expect(authStore.register).not.toHaveBeenCalled();
  });

  it('marks confirmPassword as mismatch when passwords differ', () => {
    const fixture = TestBed.createComponent(RegisterNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({
      password: 'Abcdefg1!',
      confirmPassword: 'Abcdefg1?',
    });
    expect(fixture.componentInstance.form.hasError('passwordMismatch')).toBe(
      true,
    );
  });

  it('clears mismatch when passwords match', () => {
    const fixture = TestBed.createComponent(RegisterNativePage);
    fixture.detectChanges();
    const form = fixture.componentInstance.form;
    form.patchValue({ password: 'Abcdefg1!', confirmPassword: 'wrong' });
    expect(form.hasError('passwordMismatch')).toBe(true);
    form.patchValue({ confirmPassword: 'Abcdefg1!' });
    expect(form.hasError('passwordMismatch')).toBe(false);
  });

  it('submits valid payload and navigates to email-sent on success', async () => {
    const fixture = TestBed.createComponent(RegisterNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Abcdefg1!',
      confirmPassword: 'Abcdefg1!',
      companyName: '',
      vatNumber: '',
    });
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
    expect(authStore.register).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/m/auth/email-sent'],
      jasmine.any(Object),
    );
  });

  it('resets form on ionViewWillEnter', () => {
    const fixture = TestBed.createComponent(RegisterNativePage);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({ firstName: 'X' });
    fixture.componentInstance.errorMessage = 'oops';
    fixture.componentInstance.ionViewWillEnter();
    expect(fixture.componentInstance.form.value.firstName).toBe('');
    expect(fixture.componentInstance.errorMessage).toBeNull();
  });
});
