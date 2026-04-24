import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayRowComponent } from '../../shared/display-row.component';

type Language = 'fr' | 'en';

@Component({
  selector: 'app-preferences-tab',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, DisplayRowComponent],
  templateUrl: './preferences-tab.component.html',
})
export class PreferencesTabComponent {
  @Input() currentLanguage: Language = 'fr';
  @Input() error: string | null = null;
  @Output() languageChange = new EventEmitter<Language>();

  isEditing = signal(false);
  savedFlash = signal(false);

  enterEdit(): void {
    this.isEditing.set(true);
  }

  selectLanguage(lang: Language): void {
    if (lang === this.currentLanguage) {
      this.isEditing.set(false);
      return;
    }
    this.languageChange.emit(lang);
    this.isEditing.set(false);
    this.savedFlash.set(true);
    setTimeout(() => this.savedFlash.set(false), 2000);
  }

  get languageLabel(): string {
    return this.currentLanguage === 'fr'
      ? 'PREFERENCES.LANGUAGE.FRENCH'
      : 'PREFERENCES.LANGUAGE.ENGLISH';
  }
}
