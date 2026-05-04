import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ContactPage } from './contact.page';
import { HapticService } from '@core/native';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { environment } from '../../../environments/environment';

describe('ContactPage', () => {
  let component: ContactPage;
  let fixture: ComponentFixture<ContactPage>;
  let httpMock: HttpTestingController;
  const mockHaptic = jasmine.createSpyObj('HapticService', ['medium']);

  beforeEach(async () => {
    mockHaptic.medium.calls.reset();
    mockHaptic.medium.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      declarations: [ContactPage],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        InputComponent,
        ButtonComponent,
        BrowserHeaderComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HapticService, useValue: mockHaptic },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ContactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not fire haptic when form is invalid', () => {
    component.form.patchValue({
      name: '',
      email: 'not-an-email',
      subject: '',
      message: '',
    });
    component.onSubmit();
    expect(mockHaptic.medium).not.toHaveBeenCalled();
  });

  it('fires medium haptic when form is valid and submitted', () => {
    component.form.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'A message that is long enough.',
    });
    component.onSubmit();
    expect(mockHaptic.medium).toHaveBeenCalled();

    const req = httpMock.expectOne(`${environment.apiUrl}/content/contact`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: { messageId: 'm-1', message: 'ok' } });
    expect(component.isSent).toBeTrue();
  });

  it('handles submission error and exits loading state', () => {
    component.form.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'A message that is long enough.',
    });
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/content/contact`);
    req.flush('boom', { status: 500, statusText: 'Server error' });
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBeTruthy();
  });
});
