import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService (web fallback)', () => {
  let service: SecureStorageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureStorageService);
    await Preferences.clear();
  });

  it('creates', () => expect(service).toBeTruthy());

  it('setItem() then getItem() round-trips a string', async () => {
    await service.setItem('k', 'v');
    expect(await service.getItem('k')).toBe('v');
  });

  it('getItem() returns null when nothing is stored', async () => {
    expect(await service.getItem('missing')).toBeNull();
  });

  it('removeItem() drops the value', async () => {
    await service.setItem('k', 'v');
    await service.removeItem('k');
    expect(await service.getItem('k')).toBeNull();
  });
});
