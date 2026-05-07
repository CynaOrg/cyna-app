import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './api.service';
import { Product } from '../interfaces/product.interface';

export interface HomepageContent {
  topServices: Product[];
  topProducts: Product[];
}

@Injectable({
  providedIn: 'root',
})
export class ContentApiService {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);

  private get lang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'fr';
  }

  getHomepage(): Observable<HomepageContent> {
    return this.api
      .get<HomepageContent>('content/homepage', { lang: this.lang })
      .pipe(
        map((response) => ({
          topServices: response?.topServices ?? [],
          topProducts: response?.topProducts ?? [],
        })),
      );
  }
}
