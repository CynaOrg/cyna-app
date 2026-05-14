import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InvoiceService } from './invoice.service';
import { environment } from 'src/environments/environment';
import { Invoice } from '@core/interfaces/invoice.interface';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/api/v1/billing/invoices`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InvoiceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() requests with default limit=5', () => {
    service.list().subscribe();
    const req = http.expectOne(`${base}?limit=5`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('list() honours custom limit', () => {
    service.list(20).subscribe();
    http.expectOne(`${base}?limit=20`).flush([]);
  });

  it('list() returns the invoice array', () => {
    const invoices: Invoice[] = [{ id: 'i1' } as Invoice];
    service.list().subscribe((res) => expect(res).toEqual(invoices));
    http.expectOne(`${base}?limit=5`).flush(invoices);
  });

  it('list() maps 501 to []', () => {
    service.list().subscribe((res) => expect(res).toEqual([]));
    http
      .expectOne(`${base}?limit=5`)
      .flush({}, { status: 501, statusText: 'Not Implemented' });
  });

  it('list() maps 404 to []', () => {
    service.list().subscribe((res) => expect(res).toEqual([]));
    http
      .expectOne(`${base}?limit=5`)
      .flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('list() rethrows other errors', () => {
    let thrown: unknown;
    service.list().subscribe({ error: (e) => (thrown = e) });
    http
      .expectOne(`${base}?limit=5`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    expect(thrown).toBeTruthy();
  });
});
