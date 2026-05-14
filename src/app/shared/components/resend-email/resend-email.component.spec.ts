import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ResendEmailComponent } from './resend-email.component';
import { AuthStore } from '@core/stores/auth.store';

describe('ResendEmailComponent', () => {
  let fixture: ComponentFixture<ResendEmailComponent>;
  let component: ResendEmailComponent;
  let authStore: jasmine.SpyObj<AuthStore>;

  beforeEach(async () => {
    authStore = jasmine.createSpyObj('AuthStore', [
      'forgotPassword',
      'resendVerification',
    ]);

    await TestBed.configureTestingModule({
      imports: [ResendEmailComponent, TranslateModule.forRoot()],
      providers: [{ provide: AuthStore, useValue: authStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResendEmailComponent);
    component = fixture.componentInstance;
    component.email = 'test@test.com';
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('honours an initial cooldown', () => {
    component.initialCooldown = 30;
    fixture.detectChanges();
    expect(component.cooldown).toBe(30);
  });

  it('resend() calls resendVerification by default', () => {
    authStore.resendVerification.and.returnValue(of({ message: 'ok' }));
    fixture.detectChanges();
    component.resend();
    expect(authStore.resendVerification).toHaveBeenCalledWith('test@test.com');
  });

  it('resend() calls forgotPassword in forgot-password mode', () => {
    component.mode = 'forgot-password';
    authStore.forgotPassword.and.returnValue(of({ message: 'ok' }) as never);
    fixture.detectChanges();
    component.resend();
    expect(authStore.forgotPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
    });
  });

  it('resend() is a no-op when cooldown > 0', () => {
    component.cooldown = 10;
    fixture.detectChanges();
    component.resend();
    expect(authStore.resendVerification).not.toHaveBeenCalled();
  });

  it('resend() error in verification mode triggers cooldown', () => {
    authStore.resendVerification.and.returnValue(
      throwError(() => new Error('x')),
    );
    fixture.detectChanges();
    component.resend();
    expect(component.cooldown).toBeGreaterThan(0);
  });

  it('resend() success marks sent=true and starts cooldown after the toast', fakeAsync(() => {
    authStore.resendVerification.and.returnValue(of({ message: 'ok' }));
    fixture.detectChanges();
    component.resend();
    expect(component.sent).toBeTrue();
    tick(3000);
    expect(component.sent).toBeFalse();
    expect(component.cooldown).toBeGreaterThan(0);
  }));
});
