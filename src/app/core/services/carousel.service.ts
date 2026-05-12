import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CarouselSlide } from '../interfaces/carousel.interface';

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private readonly api = inject(ApiService);

  getActiveSlides(lang: 'fr' | 'en' = 'fr'): Observable<CarouselSlide[]> {
    return this.api.get<CarouselSlide[]>('content/carousel', { lang });
  }
}
