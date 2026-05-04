import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../environments/environment';
import { ContactNativePage } from './contact-native.page';

describe('ContactNativePage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        ContactNativePage,
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('creates the page', () => {
    const fixture = TestBed.createComponent(ContactNativePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('marks the form invalid until all fields are filled', () => {
    const fixture = TestBed.createComponent(ContactNativePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.form.invalid).toBe(true);
    page.form.setValue({
      name: 'Tom',
      email: 'tom@cyna.app',
      subject: 'Hello',
      message: 'A message of more than ten chars',
    });
    expect(page.form.valid).toBe(true);
  });

  it('does not POST when the form is invalid and shows touched errors', () => {
    const fixture = TestBed.createComponent(ContactNativePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.onSubmit();
    expect(page.form.touched).toBe(true);
    http.expectNone(`${environment.apiUrl}/content/contact`);
  });

  it('POSTs the trimmed payload and flips to the success state', () => {
    const fixture = TestBed.createComponent(ContactNativePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.setValue({
      name: '  Tom  ',
      email: 'TOM@cyna.app',
      subject: '  Hello  ',
      message: '  This is a message  ',
    });
    page.onSubmit();
    const req = http.expectOne(`${environment.apiUrl}/content/contact`);
    expect(req.request.body).toEqual({
      name: 'Tom',
      email: 'tom@cyna.app',
      subject: 'Hello',
      message: 'This is a message',
    });
    req.flush({ data: { messageId: 'm', message: 'ok' } });
    expect(page.isSent()).toBe(true);
    expect(page.isLoading()).toBe(false);
  });

  it('exposes a localized error message when the request fails', () => {
    const fixture = TestBed.createComponent(ContactNativePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.setValue({
      name: 'Tom',
      email: 'tom@cyna.app',
      subject: 'Hi',
      message: 'A message of more than ten chars',
    });
    page.onSubmit();
    const req = http.expectOne(`${environment.apiUrl}/content/contact`);
    req.flush({}, { status: 500, statusText: 'Server Error' });
    expect(page.errorMessage()).toBe('CONTACT.ERROR_GENERIC');
    expect(page.isLoading()).toBe(false);
  });

  it('resets the form when resetForm() is called', () => {
    const fixture = TestBed.createComponent(ContactNativePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.setValue({
      name: 'Tom',
      email: 'tom@cyna.app',
      subject: 'Hi',
      message: 'A message of more than ten chars',
    });
    page.isSent.set(true);
    page.errorMessage.set('boom');
    page.resetForm();
    expect(page.isSent()).toBe(false);
    expect(page.errorMessage()).toBeNull();
    expect(page.form.value.name).toBeFalsy();
  });

  it('returns translated errors via getError() per validator', () => {
    const fixture = TestBed.createComponent(ContactNativePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;

    page.form.get('email')?.setValue('not-an-email');
    page.form.get('email')?.markAsTouched();
    expect(page.getError('email')).toBe('CONTACT.VALIDATION.EMAIL_INVALID');

    page.form.get('message')?.setValue('hi');
    page.form.get('message')?.markAsTouched();
    expect(page.getError('message')).toBe(
      'CONTACT.VALIDATION.MESSAGE_MIN_LENGTH',
    );

    page.form.get('name')?.markAsTouched();
    expect(page.getError('name')).toBe('CONTACT.VALIDATION.NAME_REQUIRED');
  });
});
