import { TestBed } from '@angular/core/testing';
import { PreferencesService } from './preferences.service';

/**
 * The real @capacitor/preferences module is the web shim during karma tests
 * which falls back to in-memory storage. Verify functional behavior rather
 * than mocking the static module API (spyOn on static getters is brittle).
 */
describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreferencesService);
    await service.clear();
  });

  it('creates', () => expect(service).toBeTruthy());

  it('set() then get() round-trips JSON values', async () => {
    await service.set('k', { foo: 1 });
    const result = await service.get<{ foo: number }>('k');
    expect(result).toEqual({ foo: 1 });
  });

  it('get() returns null for missing keys', async () => {
    expect(await service.get('does-not-exist')).toBeNull();
  });

  it('remove() drops the key', async () => {
    await service.set('k', 'v');
    await service.remove('k');
    expect(await service.get('k')).toBeNull();
  });

  it('getOrCreateSessionId() returns a UUID and caches it', async () => {
    const id1 = await service.getOrCreateSessionId();
    expect(id1).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    const id2 = await service.getOrCreateSessionId();
    expect(id2).toBe(id1);
  });

  it('regenerateSessionId() returns a fresh UUID', async () => {
    const id1 = await service.getOrCreateSessionId();
    const id2 = await service.regenerateSessionId();
    expect(id2).not.toBe(id1);
    expect(await service.getOrCreateSessionId()).toBe(id2);
  });
});
