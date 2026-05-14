import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PaymentMethodService } from './payment-method.service';
import { environment } from 'src/environments/environment';
import { PaymentMethod } from '@core/interfaces/payment-method.interface';

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/api/v1/billing/payment-methods`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentMethodService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() returns the array', () => {
    const data: PaymentMethod[] = [{ id: 'pm_1' } as PaymentMethod];
    service.list().subscribe((res) => expect(res).toEqual(data));
    http.expectOne(base).flush(data);
  });

  it('list() maps 404 to []', () => {
    service.list().subscribe((res) => expect(res).toEqual([]));
    http.expectOne(base).flush({}, { status: 404, statusText: 'NF' });
  });

  it('list() rethrows other errors', () => {
    let thrown: unknown;
    service.list().subscribe({ error: (e) => (thrown = e) });
    http.expectOne(base).flush({}, { status: 500, statusText: 'X' });
    expect(thrown).toBeTruthy();
  });

  it('remove() DELETEs the method', () => {
    service.remove('pm_1').subscribe();
    const req = http.expectOne(`${base}/pm_1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('remove() swallows 501/404', () => {
    service.remove('pm_1').subscribe((res) => expect(res).toBeUndefined());
    http.expectOne(`${base}/pm_1`).flush({}, { status: 501, statusText: 'NI' });
  });

  it('setDefault() PATCHes the method', () => {
    service.setDefault('pm_1').subscribe();
    const req = http.expectOne(`${base}/pm_1/default`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('setDefault() swallows 404', () => {
    service.setDefault('pm_1').subscribe((res) => expect(res).toBeUndefined());
    http
      .expectOne(`${base}/pm_1/default`)
      .flush({}, { status: 404, statusText: 'NF' });
  });
});
