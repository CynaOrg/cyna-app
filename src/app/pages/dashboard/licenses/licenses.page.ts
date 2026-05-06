import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { LicenseApiService } from '@core/services/license-api.service';
import { License } from '@core/interfaces/license.interface';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  standalone: false,
  selector: 'app-dashboard-licenses',
  templateUrl: './licenses.page.html',
})
export class DashboardLicensesPage implements OnInit {
  private readonly licenseApi = inject(LicenseApiService);
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastController);

  readonly isNative = isNativeCapacitor();

  licenses = signal<License[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  copiedKey: string | null = null;
  revealedKeys = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);
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

  retry(): void {
    this.load();
  }

  isRevealed(key: string): boolean {
    return this.revealedKeys().has(key);
  }

  toggleReveal(key: string): void {
    const current = new Set(this.revealedKeys());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.revealedKeys.set(current);
  }

  maskKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  }

  getProductName(license: License): string {
    const lang =
      this.translate.currentLang || this.translate.defaultLang || 'fr';
    return lang === 'en'
      ? license.productSnapshot.nameEn
      : license.productSnapshot.nameFr;
  }

  copyKey(key: string): void {
    navigator.clipboard
      .writeText(key)
      .then(async () => {
        this.copiedKey = key;
        setTimeout(() => {
          this.copiedKey = null;
        }, 2000);
        if (this.isNative) {
          const t = await this.toast.create({
            message: this.translate.instant('DASHBOARD.LICENSES.COPIED_TOAST'),
            duration: 1500,
            position: 'bottom',
          });
          await t.present();
        }
      })
      .catch(() => {
        // Clipboard write rejected (e.g. permission denied) — do not toggle state.
      });
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
