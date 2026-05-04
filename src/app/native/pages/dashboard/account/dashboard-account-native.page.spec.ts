import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/stores/auth.store';
import { UserResponse } from '@core/interfaces/auth.interface';
import { DashboardAccountNativePage } from './dashboard-account-native.page';

const user = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'A',
  lastName: 'B',
  companyName: 'Acme',
  vatNumber: 'FR1234',
  preferredLanguage: 'fr',
} as unknown as UserResponse;

describe('DashboardAccountNativePage', () => {
  let fixture: ComponentFixture<DashboardAccountNativePage>;
  let component: DashboardAccountNativePage;
  let store: {
    user$: BehaviorSubject<UserResponse | null>;
    error$: BehaviorSubject<string | null>;
    errorValue: string | null;
    getProfile: jasmine.Spy;
    updateProfile: jasmine.Spy;
    updatePassword: jasmine.Spy;
    updateLanguage: jasmine.Spy;
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    store = {
      user$: new BehaviorSubject<UserResponse | null>(user),
      error$: new BehaviorSubject<string | null>(null),
      errorValue: null,
      getProfile: jasmine.createSpy().and.returnValue(of(user)),
      updateProfile: jasmine
        .createSpy()
        .and.returnValue(of({ user, message: '' })),
      updatePassword: jasmine.createSpy().and.returnValue(of({ message: '' })),
      updateLanguage: jasmine
        .createSpy()
        .and.returnValue(of({ user, message: '' })),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardAccountNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: store },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAccountNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('hydrates form fields from the user store', () => {
    expect(component).toBeTruthy();
    expect(component.firstName).toBe('A');
    expect(component.lastName).toBe('B');
    expect(component.companyName).toBe('Acme');
    expect(component.vatNumber).toBe('FR1234');
    expect(component.currentLanguage()).toBe('fr');
  });

  it('switches tab on setTab', () => {
    component.setTab('security');
    expect(component.activeTab()).toBe('security');
  });

  it('saveProfile calls the store', () => {
    component.saveProfile();
    expect(store.updateProfile).toHaveBeenCalled();
  });

  it('saveProfile surfaces error messages', () => {
    store.updateProfile.and.returnValue(throwError(() => new Error('x')));
    store.errorValue = 'fail';
    component.saveProfile();
    expect(component.profileError()).toBe('fail');
  });

  it('savePassword requires both fields', () => {
    component.currentPassword = '';
    component.newPassword = '';
    component.savePassword();
    expect(component.passwordError()).toBe('Champs requis');
    expect(store.updatePassword).not.toHaveBeenCalled();
  });

  it('savePassword sends both fields when filled', () => {
    component.currentPassword = 'old';
    component.newPassword = 'new12345';
    component.savePassword();
    expect(store.updatePassword).toHaveBeenCalledWith({
      currentPassword: 'old',
      newPassword: 'new12345',
    });
  });

  it('changeLanguage forwards to the store and updates state', () => {
    component.changeLanguage('en');
    expect(store.updateLanguage).toHaveBeenCalledWith({
      preferredLanguage: 'en',
    });
    expect(component.currentLanguage()).toBe('en');
  });

  it('changeLanguage is a no-op for the current language', () => {
    component.changeLanguage('fr');
    expect(store.updateLanguage).not.toHaveBeenCalled();
  });

  it('logout proxies to the store', () => {
    component.logout();
    expect(store.logout).toHaveBeenCalled();
  });
});
