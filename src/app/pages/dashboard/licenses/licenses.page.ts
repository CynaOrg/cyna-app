import { Component, inject, OnInit, ViewChild, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY } from 'rxjs';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { LicenseApiService } from '@core/services/license-api.service';
import { License } from '@core/interfaces/license.interface';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';

@Component({
  standalone: false,
  selector: 'app-dashboard-licenses',
  templateUrl: './licenses.page.html',
})
export class DashboardLicensesPage implements OnInit, ViewWillEnter {
  private readonly licenseApi = inject(LicenseApiService);
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastController);

  readonly isNative = isNativeCapacitor();

  @ViewChild(MobilePageShellComponent) shell?: MobilePageShellComponent;

  ionViewWillEnter(): void {
    this.shell?.refresh();
  }

  licenses = signal<License[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  copiedKey: string | null = null;
  revealedKeys = signal<Set<string>>(new Set());

  private readonly gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ];

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
          this.error.set(
            err?.error?.message ||
              this.translate.instant('DASHBOARD.LICENSES.LOAD_ERROR'),
          );
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

  getProductInitials(license: License): string {
    const name = this.getProductName(license);
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  getItemGradient(license: License): string {
    const name = this.getProductName(license) || license.licenseKey;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.gradients[Math.abs(hash) % this.gradients.length];
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
}
