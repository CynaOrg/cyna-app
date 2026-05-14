import { TestBed } from '@angular/core/testing';
import { LanguageStorageService } from './language-storage.service';

describe('LanguageStorageService', () => {
  let service: LanguageStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageStorageService);
    // wipe cookies between tests
    document.cookie =
      'cyna_lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('creates', () => expect(service).toBeTruthy());

  it('load() returns null when nothing is stored', async () => {
    expect(await service.load()).toBeNull();
  });

  it('save() writes a cookie that load() can read back', async () => {
    await service.save('fr');
    expect(document.cookie).toContain('cyna_lang=fr');
    expect(await service.load()).toBe('fr');
  });

  it('load() returns en when cookie is en', async () => {
    document.cookie = 'cyna_lang=en;path=/';
    expect(await service.load()).toBe('en');
  });

  it('load() ignores invalid cookie values', async () => {
    document.cookie = 'cyna_lang=zz;path=/';
    expect(await service.load()).toBeNull();
  });
});
