import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY } from 'rxjs';
import { LicenseApiService } from '@core/services/license-api.service';
import { License } from '@core/interfaces/license.interface';

@Component({
  standalone: false,
  selector: 'app-dashboard-licenses',
  templateUrl: './licenses.page.html',
})
export class DashboardLicensesPage implements OnInit {
  private readonly licenseApi = inject(LicenseApiService);
  private readonly translate = inject(TranslateService);

  licenses = signal<License[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  copiedKey: string | null = null;

  ngOnInit(): void {
    this.licenseApi
      .getLicenses()
      .pipe(
        catchError((err) => {
          this.error.set(err?.error?.message || 'Failed to load licenses');
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((licenses) => {
        this.licenses.set(licenses);
        this.isLoading.set(false);
      });
  }

  getProductName(license: License): string {
    const lang =
      this.translate.currentLang || this.translate.defaultLang || 'fr';
    return lang === 'en'
      ? license.productSnapshot.nameEn
      : license.productSnapshot.nameFr;
  }

  copyKey(key: string): void {
    navigator.clipboard.writeText(key);
    this.copiedKey = key;
    setTimeout(() => {
      this.copiedKey = null;
    }, 2000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#34c759';
      case 'revoked':
        return '#ff383c';
      case 'expired':
        return '#9ca3af';
      default:
        return '#ff9500';
    }
  }
}
