import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWillEnter } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorGlobe, phosphorCheck } from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { AuthStore } from '@core/stores/auth.store';

type Language = 'fr' | 'en';

interface LanguageOption {
  code: Language;
  labelKey: string;
}

/**
 * Native-only Preferences sub-page reachable from the bottom-tab Account.
 * Lets the user pick the interface language; the value is persisted on the
 * profile via AuthStore.updateLanguage and mirrored to the cyna_lang cookie
 * so the next request honours the new locale.
 */
@Component({
  selector: 'app-account-preferences',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgIconComponent,
    MobilePageShellComponent,
  ],
  viewProviders: [provideIcons({ phosphorGlobe, phosphorCheck })],
  template: `
    <app-mobile-page-shell
      [showBack]="true"
      title="ACCOUNT.MENU.PREFERENCES"
      [showSearch]="true"
      [showCart]="true"
    >
      <h2
        class="px-6 pt-6 pb-2 text-xs uppercase tracking-wider text-text-muted"
      >
        {{ 'ACCOUNT.SECTIONS.LANGUAGE' | translate }}
      </h2>
      <div class="mx-4 my-2 rounded-xl bg-surface overflow-hidden">
        @for (option of options; track option.code; let last = $last) {
          <button
            type="button"
            (click)="selectLanguage(option.code)"
            class="flex w-full items-center gap-3 px-4 py-3 text-left"
            style="appearance: none; -webkit-appearance: none; background: transparent; border: none;"
          >
            <ng-icon
              name="phosphorGlobe"
              size="20"
              [style.color]="'var(--color-text-secondary)'"
            />
            <span class="flex-1" [style.color]="'var(--color-text-primary)'">
              {{ option.labelKey | translate }}
            </span>
            @if (currentLanguage() === option.code) {
              <ng-icon
                name="phosphorCheck"
                size="20"
                [style.color]="'#4f39f6'"
              />
            }
          </button>
          @if (!last) {
            <div class="ml-12 h-px bg-black/10"></div>
          }
        }
      </div>

      @if (error()) {
        <p class="mx-4 mt-2 text-sm text-red-500">{{ error() }}</p>
      }
      @if (savedFlash()) {
        <p class="mx-4 mt-2 text-sm text-green-600">
          {{ 'PREFERENCES.LANGUAGE.SAVED' | translate }}
        </p>
      }
    </app-mobile-page-shell>
  `,
})
export class AccountPreferencesPage implements ViewWillEnter {
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

  readonly options: LanguageOption[] = [
    { code: 'fr', labelKey: 'PREFERENCES.LANGUAGE.FRENCH' },
    { code: 'en', labelKey: 'PREFERENCES.LANGUAGE.ENGLISH' },
  ];

  readonly currentLanguage = signal<Language>('fr');
  readonly error = signal<string | null>(null);
  readonly savedFlash = signal(false);

  ionViewWillEnter(): void {
    this.authStore.getProfile().subscribe({
      next: (user) => {
        this.currentLanguage.set(this.normalize(user.preferredLanguage));
      },
    });
  }

  selectLanguage(language: Language): void {
    if (language === this.currentLanguage()) return;
    this.error.set(null);
    this.authStore.clearError();
    this.authStore.updateLanguage({ preferredLanguage: language }).subscribe({
      next: () => {
        this.currentLanguage.set(language);
        this.translate.use(language);
        document.cookie = `cyna_lang=${language};path=/;max-age=31536000;Secure;SameSite=Strict`;
        this.savedFlash.set(true);
        setTimeout(() => this.savedFlash.set(false), 2000);
      },
      error: () => {
        this.error.set(
          this.authStore.errorValue ?? 'Failed to update language',
        );
      },
    });
  }

  private normalize(lang: string | null | undefined): Language {
    const normalized = (lang ?? 'fr').toLowerCase();
    return normalized === 'en' ? 'en' : 'fr';
  }
}
