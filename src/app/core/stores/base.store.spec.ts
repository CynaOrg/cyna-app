import { firstValueFrom } from 'rxjs';
import { BaseStore } from './base.store';

class TestStore extends BaseStore<number> {}

describe('BaseStore', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  it('starts with null data, not loading, no error', async () => {
    expect(await firstValueFrom(store.data$)).toBeNull();
    expect(await firstValueFrom(store.isLoading$)).toBeFalse();
    expect(await firstValueFrom(store.error$)).toBeNull();
  });

  it('setLoading() flips the flag and clears error', async () => {
    store.setError('oh no');
    store.setLoading(true);
    expect(await firstValueFrom(store.isLoading$)).toBeTrue();
    expect(await firstValueFrom(store.error$)).toBeNull();
  });

  it('setError() exposes the message and clears loading', async () => {
    store.setLoading(true);
    store.setError('boom');
    expect(await firstValueFrom(store.error$)).toBe('boom');
    expect(await firstValueFrom(store.isLoading$)).toBeFalse();
  });

  it('setData() publishes data and clears loading/error', async () => {
    store.setLoading(true);
    store.setData(42);
    expect(await firstValueFrom(store.data$)).toBe(42);
    expect(await firstValueFrom(store.isLoading$)).toBeFalse();
    expect(await firstValueFrom(store.error$)).toBeNull();
  });

  it('reset() returns the initial state', async () => {
    store.setData(42);
    store.reset();
    expect(await firstValueFrom(store.data$)).toBeNull();
  });
});
