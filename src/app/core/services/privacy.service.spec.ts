import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PrivacyService } from './privacy.service';
import { environment } from 'src/environments/environment';

describe('PrivacyService', () => {
  let service: PrivacyService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/api/v1/users/me/data-export`;
  // The service builds: environment.apiUrl + '/api/v1/users/me/data-export'

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PrivacyService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns pending when the server accepts the request', () => {
    service.requestDataExport().subscribe((res) => {
      expect(res).toEqual({ status: 'pending' });
    });
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'pending' });
  });

  it('maps 501 to unavailable', () => {
    service.requestDataExport().subscribe((res) => {
      expect(res).toEqual({ status: 'unavailable' });
    });
    http
      .expectOne(url)
      .flush({}, { status: 501, statusText: 'Not Implemented' });
  });

  it('maps 404 to unavailable', () => {
    service.requestDataExport().subscribe((res) => {
      expect(res).toEqual({ status: 'unavailable' });
    });
    http.expectOne(url).flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('re-throws other errors', () => {
    let thrown: unknown;
    service.requestDataExport().subscribe({
      error: (e) => (thrown = e),
    });
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server Error' });
    expect(thrown).toBeTruthy();
  });
});
