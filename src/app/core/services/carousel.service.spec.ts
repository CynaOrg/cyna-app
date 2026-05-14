import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { CarouselService } from './carousel.service';
import { ApiService } from './api.service';
import { CarouselSlide } from '../interfaces/carousel.interface';

describe('CarouselService', () => {
  let service: CarouselService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [CarouselService, { provide: ApiService, useValue: api }],
    });
    service = TestBed.inject(CarouselService);
  });

  it('creates', () => expect(service).toBeTruthy());

  it('getActiveSlides defaults to fr', async () => {
    api.get.and.returnValue(of([] as CarouselSlide[]));
    await firstValueFrom(service.getActiveSlides());
    expect(api.get).toHaveBeenCalledWith('content/carousel', { lang: 'fr' });
  });

  it('getActiveSlides forwards the en lang', async () => {
    api.get.and.returnValue(of([] as CarouselSlide[]));
    await firstValueFrom(service.getActiveSlides('en'));
    expect(api.get).toHaveBeenCalledWith('content/carousel', { lang: 'en' });
  });

  it('getActiveSlides returns the slides', async () => {
    const slides: CarouselSlide[] = [{ id: 'c1' } as CarouselSlide];
    api.get.and.returnValue(of(slides));
    expect(await firstValueFrom(service.getActiveSlides())).toEqual(slides);
  });
});
