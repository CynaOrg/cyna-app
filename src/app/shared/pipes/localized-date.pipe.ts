import {
  ChangeDetectorRef,
  inject,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false,
})
export class LocalizedDatePipe implements PipeTransform, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sub: Subscription;
  private lastValue: string | Date | number | null | undefined = undefined;
  private lastFormat = '';
  private lastLang = '';
  private cached = '';

  constructor() {
    this.sub = this.translate.onLangChange.subscribe(() => {
      this.lastLang = '';
      this.cdr.markForCheck();
    });
  }

  transform(
    value: string | Date | number | null | undefined,
    format = 'mediumDate',
  ): string {
    if (value === null || value === undefined || value === '') return '';
    const lang =
      this.translate.currentLang || this.translate.defaultLang || 'fr';
    if (
      this.cached &&
      value === this.lastValue &&
      format === this.lastFormat &&
      lang === this.lastLang
    ) {
      return this.cached;
    }
    const locale = lang === 'en' ? 'en-US' : 'fr-FR';
    this.lastValue = value;
    this.lastFormat = format;
    this.lastLang = lang;
    try {
      this.cached = formatDate(value, format, locale);
    } catch {
      this.cached = '';
    }
    return this.cached;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
