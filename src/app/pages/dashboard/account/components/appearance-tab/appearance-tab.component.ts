import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-appearance-tab',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, NgIconComponent],
  templateUrl: './appearance-tab.component.html',
})
export class AppearanceTabComponent {
  @Input() currentLanguage: 'fr' | 'en' = 'fr';
  @Input() error: string | null = null;

  @Output() languageChange = new EventEmitter<'fr' | 'en'>();

  languageLoading = signal(false);
  languageSuccess = signal(false);

  onLanguageChange(language: 'fr' | 'en'): void {
    if (language === this.currentLanguage) return;

    this.languageSuccess.set(false);
    this.languageLoading.set(true);

    this.languageChange.emit(language);
  }

  onLanguageSuccess(): void {
    this.languageSuccess.set(true);
    this.languageLoading.set(false);
    setTimeout(() => this.languageSuccess.set(false), 3000);
  }

  onLanguageError(): void {
    this.languageLoading.set(false);
  }
}