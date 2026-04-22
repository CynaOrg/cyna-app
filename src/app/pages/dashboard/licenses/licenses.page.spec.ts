import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorCertificate } from '@ng-icons/phosphor-icons/regular';
import { DashboardLicensesPage } from './licenses.page';
import { LicenseApiService } from '@core/services/license-api.service';
import { License } from '@core/interfaces/license.interface';

describe('DashboardLicensesPage', () => {
  let component: DashboardLicensesPage;
  let fixture: ComponentFixture<DashboardLicensesPage>;
  let licenseApi: jasmine.SpyObj<LicenseApiService>;
  let translate: TranslateService;

  const mockLicense: License = {
    id: '1',
    licenseKey: 'CYNA-AAAA-BBBB-CCCC-DDDD',
    productSnapshot: {
      nameFr: 'Antivirus',
      nameEn: 'Antivirus EN',
      slug: 'antivirus',
    },
    orderId: 'o1',
    productId: 'p1',
    status: 'active',
    activatedAt: null,
    expiresAt: null,
    email: 'e@x.com',
    createdAt: '2026-04-22',
  };

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('LicenseApiService', ['getLicenses']);

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        NgIconComponent,
        TranslateModule.forRoot(),
      ],
      declarations: [DashboardLicensesPage],
      providers: [
        provideIcons({ phosphorCertificate }),
        { provide: LicenseApiService, useValue: apiSpy },
      ],
    }).compileComponents();

    licenseApi = TestBed.inject(
      LicenseApiService,
    ) as jasmine.SpyObj<LicenseApiService>;
    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('fr');
    translate.use('fr');
    fixture = TestBed.createComponent(DashboardLicensesPage);
    component = fixture.componentInstance;
  });

  it('loads licenses on init and sets loading false', () => {
    licenseApi.getLicenses.and.returnValue(of([mockLicense]));
    fixture.detectChanges();
    expect(component.licenses()).toEqual([mockLicense]);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('sets error message on API failure', () => {
    licenseApi.getLicenses.and.returnValue(
      throwError(() => ({ error: { message: 'Server error' } })),
    );
    fixture.detectChanges();
    expect(component.error()).toBe('Server error');
    expect(component.isLoading()).toBe(false);
    expect(component.licenses()).toEqual([]);
  });

  it('falls back to generic error message when error has no message', () => {
    licenseApi.getLicenses.and.returnValue(throwError(() => new Error('net')));
    fixture.detectChanges();
    expect(component.error()).toBe('Failed to load licenses');
    expect(component.isLoading()).toBe(false);
  });

  describe('getProductName', () => {
    beforeEach(() => {
      licenseApi.getLicenses.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('returns nameFr when lang is fr', () => {
      translate.use('fr');
      expect(component.getProductName(mockLicense)).toBe('Antivirus');
    });

    it('returns nameEn when lang is en', () => {
      translate.use('en');
      expect(component.getProductName(mockLicense)).toBe('Antivirus EN');
    });

    it('falls back to nameFr when lang is unknown', () => {
      translate.use('de');
      expect(component.getProductName(mockLicense)).toBe('Antivirus');
    });
  });

  describe('copyKey', () => {
    beforeEach(() => {
      licenseApi.getLicenses.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('copies key to clipboard and tracks copiedKey on success', async () => {
      const writeSpy = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
      component.copyKey('CYNA-TEST');
      await writeSpy.calls.mostRecent().returnValue;
      expect(writeSpy).toHaveBeenCalledWith('CYNA-TEST');
      expect(component.copiedKey).toBe('CYNA-TEST');
    });

    it('does not set copiedKey when clipboard write rejects', async () => {
      const writeSpy = spyOn(navigator.clipboard, 'writeText').and.rejectWith(
        new Error('denied'),
      );
      component.copyKey('CYNA-TEST');
      try {
        await writeSpy.calls.mostRecent().returnValue;
      } catch {
        // ignored — we want to observe component state after rejection is handled
      }
      expect(component.copiedKey).toBeNull();
    });
  });

  describe('getStatusColor', () => {
    beforeEach(() => {
      licenseApi.getLicenses.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('returns green for active', () => {
      expect(component.getStatusColor('active')).toBe('#34c759');
    });

    it('returns red for revoked', () => {
      expect(component.getStatusColor('revoked')).toBe('#ff383c');
    });

    it('returns grey for expired', () => {
      expect(component.getStatusColor('expired')).toBe('#9ca3af');
    });

    it('returns orange for unknown status', () => {
      expect(component.getStatusColor('pending')).toBe('#ff9500');
    });
  });
});
