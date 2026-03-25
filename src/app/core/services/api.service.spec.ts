import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../interfaces/product.interface';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make GET request and unwrap response', () => {
    const mockData = { id: '1', name: 'Test' };

    service.get<{ id: string; name: string }>('test/path').subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/path`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: mockData,
      meta: { timestamp: '2024-01-01', requestId: 'abc' },
    });
  });

  it('should make POST request with body', () => {
    const body = { email: 'test@test.com' };
    const mockResponse = { id: '1' };

    service
      .post<typeof body, { id: string }>('test/post', body)
      .subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${baseUrl}/test/post`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ data: mockResponse });
  });

  it('should make PUT request', () => {
    const body = { name: 'Updated' };
    const mockResponse = { id: '1', name: 'Updated' };

    service
      .put<typeof body, typeof mockResponse>('test/put', body)
      .subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${baseUrl}/test/put`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ data: mockResponse });
  });

  it('should make PATCH request', () => {
    const body = { name: 'Patched' };
    const mockResponse = { id: '1', name: 'Patched' };

    service
      .patch<typeof body, typeof mockResponse>('test/patch', body)
      .subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${baseUrl}/test/patch`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush({ data: mockResponse });
  });

  it('should make DELETE request', () => {
    const mockResponse = { success: true };

    service.delete<{ success: boolean }>('test/delete').subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/delete`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: mockResponse });
  });

  it('should build query params for getPaginated', () => {
    const mockPaginated: PaginatedResponse<{ id: string }> = {
      data: [{ id: '1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    service
      .getPaginated<{ id: string }>('test/paginated', {
        page: 1,
        limit: 10,
        search: 'hello',
      })
      .subscribe((data) => {
        expect(data).toEqual(mockPaginated);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${baseUrl}/test/paginated` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '10' &&
        r.params.get('search') === 'hello',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPaginated);
  });

  it('should handle getList', () => {
    const mockList = [{ id: '1' }, { id: '2' }];

    service.getList<{ id: string }>('test/list').subscribe((data) => {
      expect(data).toEqual(mockList);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/list`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockList });
  });

  it('should not include undefined or null params', () => {
    service
      .get<string>('test/params', {
        valid: 'yes',
        falsy: false,
      })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${baseUrl}/test/params` &&
        r.params.get('valid') === 'yes' &&
        r.params.get('falsy') === 'false',
    );
    expect(req.request.params.keys().length).toBe(2);
    req.flush({ data: 'ok' });
  });
});
