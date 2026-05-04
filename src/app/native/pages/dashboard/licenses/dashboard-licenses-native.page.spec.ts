import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LicenseApiService } from '@core/services/license-api.service';
import { License } from '@core/interfaces/license.interface';
import { DashboardLicensesNativePage } from './dashboard-licenses-native.page';

const license: License = {
  id: 'l1',
  licenseKey: 'KEY-XYZ',
  productSnapshot: { nameFr: 'SOC FR', nameEn: 'SOC EN', slug: 'soc' },
  orderId: 'o1',
  productId: 'p1',
  status: 'active',
  activatedAt: null,
  expiresAt: '2027-04-01T00:00:00Z',
  email: 'a@b.c',
  createdAt: '2026-04-01T00:00:00Z',
};

describe('DashboardLicensesNativePage', () => {
  let fixture: ComponentFixture<DashboardLicensesNativePage>;
  let component: DashboardLicensesNativePage;
  let api: { getLicenses: jasmine.Spy };

  beforeEach(async () => {
    api = { getLicenses: jasmine.createSpy().and.returnValue(of([license])) };

    await TestBed.configureTestingModule({
      imports: [DashboardLicensesNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: LicenseApiService, useValue: api },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLicensesNativePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads licenses on init', () => {
    expect(component).toBeTruthy();
    expect(api.getLicenses).toHaveBeenCalled();
    expect(component.licenses().length).toBe(1);
    expect(component.isLoading()).toBeFalse();
  });

  it('returns the FR product name by default', () => {
    expect(component.getProductName(license)).toBe('SOC FR');
  });

  it('exposes proper status helpers', () => {
    expect(component.getStatusColor('active')).toBe('#34c759');
    expect(component.getStatusColor('revoked')).toBe('#ff383c');
    expect(component.getStatusLabel('active')).toBe('Active');
  });

  it('refresh re-fetches from the API', () => {
    api.getLicenses.calls.reset();
    component.refresh();
    expect(api.getLicenses).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    TestBed.resetTestingModule();
    const failingApi = {
      getLicenses: jasmine
        .createSpy()
        .and.returnValue(throwError(() => ({ error: { message: 'boom' } }))),
    };
    await TestBed.configureTestingModule({
      imports: [DashboardLicensesNativePage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: LicenseApiService, useValue: failingApi },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    const f = TestBed.createComponent(DashboardLicensesNativePage);
    f.detectChanges();
    expect(f.componentInstance.error()).toBe('boom');
    expect(f.componentInstance.isLoading()).toBeFalse();
  });
});
