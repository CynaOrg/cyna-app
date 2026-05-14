import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  input,
  signal,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayRowComponent } from '../../shared/display-row.component';
import { SectionSkeletonComponent } from '../../shared/section-skeleton.component';

type Language = 'fr' | 'en';

@Component({
  selector: 'app-preferences-tab',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    DisplayRowComponent,
    SectionSkeletonComponent,
  ],
  templateUrl: './preferences-tab.component.html',
})
export class PreferencesTabComponent {
  @Input() currentLanguage: Language = 'fr';
  @Input() error: string | null = null;
  @Input() savedFlash = false;
  loading = input<boolean>(false);
  @Output() languageChange = new EventEmitter<Language>();

  isEditing = signal(false);

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
  }

  get languageLabel(): string {
    return this.currentLanguage === 'fr'
      ? 'PREFERENCES.LANGUAGE.FRENCH'
      : 'PREFERENCES.LANGUAGE.ENGLISH';
  }
}
