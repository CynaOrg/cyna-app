import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from './api.service';
import { ContentApiService, HomepageContent } from './content-api.service';

describe('ContentApiService', () => {
  let service: ContentApiService;
  let api: jasmine.SpyObj<ApiService>;
  let translate: TranslateService;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiService', ['get']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [ContentApiService, { provide: ApiService, useValue: api }],
    });
    service = TestBed.inject(ContentApiService);
    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('fr');
  });

  it('creates', () => expect(service).toBeTruthy());

  it('getHomepage forwards the default lang to the API', async () => {
    api.get.and.returnValue(of(null as never));
    await firstValueFrom(service.getHomepage());
    expect(api.get).toHaveBeenCalledWith('content/homepage', { lang: 'fr' });
  });

  it('getHomepage uses currentLang when set', async () => {
    translate.use('en');
    api.get.and.returnValue(of(null as never));
    await firstValueFrom(service.getHomepage());
    expect(api.get).toHaveBeenCalledWith('content/homepage', { lang: 'en' });
  });

  it('getHomepage returns sensible defaults for missing fields', async () => {
    api.get.and.returnValue(of(null as never));
    const res = await firstValueFrom(service.getHomepage());
    expect(res).toEqual({
      heroText: null,
      topServices: [],
      topProducts: [],
      topLicenses: [],
    });
  });

  it('getHomepage maps a populated response', async () => {
    const payload: HomepageContent = {
      heroText: { titleFr: 'Salut' },
      topServices: [{ id: 's1' } as never],
      topProducts: [{ id: 'p1' } as never],
      topLicenses: [{ id: 'l1' } as never],
    };
    api.get.and.returnValue(of(payload));
    const res = await firstValueFrom(service.getHomepage());
    expect(res).toEqual(payload);
  });
});
