import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorKey,
  phosphorCopy,
  phosphorCheckCircle,
} from '@ng-icons/phosphor-icons/regular';
import { catchError, EMPTY } from 'rxjs';
import { LicenseApiService } from '@core/services/license-api.service';
import { License } from '@core/interfaces/license.interface';
import { NativePageHeaderComponent } from '../../../components/native-page-header.component';
import { SkeletonListComponent } from '../../../components/skeleton-list.component';
import { PullToRefreshComponent } from '../../../components/pull-to-refresh.component';
import { HapticOnDirective } from '../../../directives/haptic-on.directive';

/**
 * Native list of software licenses owned by the user, mounted at
 * `/m/dashboard/licenses`. Tapping a key copies it to the clipboard.
 */
@Component({
  selector: 'app-dashboard-licenses-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NgIconComponent,
    NativePageHeaderComponent,
    SkeletonListComponent,
    PullToRefreshComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({ phosphorKey, phosphorCopy, phosphorCheckCircle }),
  ],
  templateUrl: './dashboard-licenses-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLicensesNativePage implements OnInit {
  private readonly licenseApi = inject(LicenseApiService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(PullToRefreshComponent)
  private readonly refresher?: PullToRefreshComponent;

  readonly licenses = signal<License[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly copiedKey = signal<string | null>(null);

  ngOnInit(): void {
    this.fetch();
  }

  refresh(): void {
    this.fetch(() => void this.refresher?.complete());
  }

  copyKey(key: string): void {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(key)
      .then(() => {
        this.copiedKey.set(key);
        setTimeout(() => {
          if (this.copiedKey() === key) this.copiedKey.set(null);
        }, 2000);
      })
      .catch(() => {
        // Clipboard unavailable — silently no-op.
      });
  }

  getProductName(license: License): string {
    const lang =
      this.translate.currentLang || this.translate.defaultLang || 'fr';
    return lang === 'en'
      ? license.productSnapshot.nameEn
      : license.productSnapshot.nameFr;
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

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Active',
      revoked: 'Révoquée',
      expired: 'Expirée',
      pending: 'En attente',
    };
    return map[status] || status;
  }

  private fetch(done?: () => void): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.licenseApi
      .getLicenses()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Failed to load licenses');
          this.isLoading.set(false);
          done?.();
          return EMPTY;
        }),
      )
      .subscribe((licenses) => {
        this.licenses.set(licenses);
        this.isLoading.set(false);
        done?.();
      });
  }
}
