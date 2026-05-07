import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWillEnter } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { AuthStore } from '@core/stores/auth.store';
import { LanguageStorageService } from '@core/services/language-storage.service';

type Language = 'fr' | 'en';

/**
 * Native-only Preferences sub-page reachable from the bottom-tab Account.
 * Mirrors the web pattern: a single iOS-style card showing the current
 * language with a "Modifier" affordance that toggles to a radio picker
 * inside the same card. On select, the new language is persisted via
 * AuthStore.updateLanguage and mirrored to the cyna_lang cookie.
 */
@Component({
  selector: 'app-account-preferences',
  standalone: true,
  imports: [CommonModule, TranslateModule, MobilePageShellComponent],
  template: `
    <app-mobile-page-shell
      [showBack]="true"
      title="ACCOUNT.MENU.PREFERENCES"
      [showSearch]="true"
      [showCart]="true"
    >
      <div class="mx-4 mt-4 rounded-2xl bg-surface p-5">
        <!-- Header row: title + Modifier / Sauvegardé -->
        <div class="mb-4 flex items-center justify-between">
          <h3
            class="text-base font-semibold"
            [style.color]="'var(--color-text-primary)'"
          >
            {{ 'ACCOUNT.SECTIONS.LANGUAGE' | translate }}
          </h3>
          @if (!isEditing()) {
            <button
              type="button"
              (click)="enterEdit()"
              class="text-sm font-medium"
              style="appearance: none; -webkit-appearance: none; background: transparent; border: none; padding: 0; color: #4f39f6;"
            >
              {{ 'COMMON.EDIT' | translate }}
            </button>
          } @else if (savedFlash()) {
            <span class="text-xs text-green-600">
              {{ 'PREFERENCES.LANGUAGE.SAVED' | translate }}
            </span>
          }
        </div>

        @if (error()) {
          <p class="mb-3 text-sm text-red-500">{{ error() }}</p>
        }

        @if (!isEditing()) {
          <!-- Display mode -->
          <div class="flex flex-col gap-1">
            <span
              class="text-xs uppercase tracking-wider"
              [style.color]="'var(--color-text-muted)'"
            >
              {{ 'ACCOUNT.FIELDS.LANGUAGE_LABEL' | translate }}
            </span>
            <span
              class="text-base font-medium"
              [style.color]="'var(--color-text-primary)'"
            >
              {{ currentLanguageLabel() | translate }}
            </span>
          </div>
        } @else {
          <!-- Edit mode -->
          <div class="flex flex-col gap-3">
            @for (option of options; track option.code) {
              <label class="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="language"
                  [checked]="currentLanguage() === option.code"
                  (change)="selectLanguage(option.code)"
                  class="h-4 w-4 accent-primary"
                />
                <span
                  class="text-base"
                  [style.color]="'var(--color-text-primary)'"
                >
                  {{ option.labelKey | translate }}
                </span>
              </label>
            }
          </div>
        }
      </div>
    </app-mobile-page-shell>
  `,
})
export class AccountPreferencesPage implements ViewWillEnter {
  private readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);
  private readonly langStorage = inject(LanguageStorageService);

  readonly options: { code: Language; labelKey: string }[] = [
    { code: 'fr', labelKey: 'PREFERENCES.LANGUAGE.FRENCH' },
    { code: 'en', labelKey: 'PREFERENCES.LANGUAGE.ENGLISH' },
  ];

  readonly currentLanguage = signal<Language>('fr');
  readonly isEditing = signal(false);
  readonly error = signal<string | null>(null);
  readonly savedFlash = signal(false);

  readonly currentLanguageLabel = computed(() =>
    this.currentLanguage() === 'fr'
      ? 'PREFERENCES.LANGUAGE.FRENCH'
      : 'PREFERENCES.LANGUAGE.ENGLISH',
  );

  ionViewWillEnter(): void {
    this.authStore.getProfile().subscribe({
      next: (user) => {
        this.currentLanguage.set(this.normalize(user.preferredLanguage));
      },
    });
  }

  enterEdit(): void {
    this.isEditing.set(true);
    this.savedFlash.set(false);
    this.error.set(null);
  }

  selectLanguage(language: Language): void {
    if (language === this.currentLanguage()) {
      this.isEditing.set(false);
      return;
    }
    this.error.set(null);
    this.authStore.clearError();
    this.authStore.updateLanguage({ preferredLanguage: language }).subscribe({
      next: () => {
        this.currentLanguage.set(language);
        this.translate.use(language);
        void this.langStorage.save(language);
        this.savedFlash.set(true);
        this.isEditing.set(false);
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
