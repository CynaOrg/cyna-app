import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LicenseApiService } from './license-api.service';
import { ApiService } from './api.service';
import { License } from '../interfaces/license.interface';

describe('LicenseApiService', () => {
  let service: LicenseApiService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockLicense: License = {
    id: 'lic-1',
    licenseKey: 'CYNA-AAAA-BBBB-CCCC-DDDD',
    productSnapshot: { nameFr: 'EDR', nameEn: 'EDR', slug: 'edr' },
    orderId: 'order-1',
    productId: 'prod-1',
    status: 'active',
    activatedAt: null,
    expiresAt: null,
    email: 'user@test.cyna',
    createdAt: '2026-04-22T00:00:00Z',
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'getList']);

    TestBed.configureTestingModule({
      providers: [LicenseApiService, { provide: ApiService, useValue: apiSpy }],
    });

    service = TestBed.inject(LicenseApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLicenses', () => {
    it('calls GET licenses and returns the list', () => {
      apiSpy.getList.and.returnValue(of([mockLicense]));

      service.getLicenses().subscribe((res) => {
        expect(res).toEqual([mockLicense]);
      });

      expect(apiSpy.getList).toHaveBeenCalledWith('licenses');
    });

    it('propagates errors from ApiService', (done) => {
      apiSpy.getList.and.returnValue(throwError(() => new Error('fail')));
      service.getLicenses().subscribe({
        error: (err) => {
          expect(err.message).toBe('fail');
          done();
        },
      });
    });
  });

  describe('getLicenseById', () => {
    it('calls GET licenses/:id with the given id', () => {
      apiSpy.get.and.returnValue(of(mockLicense));

      service.getLicenseById('lic-1').subscribe((res) => {
        expect(res).toEqual(mockLicense);
      });

      expect(apiSpy.get).toHaveBeenCalledWith('licenses/lic-1');
    });

    it('propagates errors from ApiService', (done) => {
      apiSpy.get.and.returnValue(throwError(() => new Error('not found')));
      service.getLicenseById('lic-1').subscribe({
        error: (err) => {
          expect(err.message).toBe('not found');
          done();
        },
      });
    });
  });
});
