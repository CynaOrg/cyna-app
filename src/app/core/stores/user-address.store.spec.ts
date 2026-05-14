import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { UserAddressStore } from './user-address.store';
import { UserAddressApiService } from '../services/user-address-api.service';
import { UserAddress } from '../interfaces/user-address.interface';

const addr = (id: string, over: Partial<UserAddress> = {}): UserAddress => ({
  id,
  label: id,
  recipientName: 'A',
  street: '1 rue',
  city: 'Paris',
  postalCode: '75000',
  country: 'FR',
  isDefaultShipping: false,
  isDefaultBilling: false,
  createdAt: '2026-04-24T00:00:00Z',
  updatedAt: '2026-04-24T00:00:00Z',
  ...over,
});

describe('UserAddressStore', () => {
  let store: UserAddressStore;
  let api: jasmine.SpyObj<UserAddressApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<UserAddressApiService>('UserAddressApiService', [
      'list',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        UserAddressStore,
        { provide: UserAddressApiService, useValue: api },
      ],
    });
    store = TestBed.inject(UserAddressStore);
  });

  it('load() populates data$ on success', (done) => {
    api.list.and.returnValue(of([addr('a1')]));
    store.data$.subscribe((d) => {
      if (d && d.length === 1) {
        expect(d[0].id).toBe('a1');
        done();
      }
    });
    store.load();
  });

  it('load() sets error on failure', (done) => {
    api.list.and.returnValue(throwError(() => new Error('boom')));
    store.error$.subscribe((e) => {
      if (e) {
        expect(e).toContain('boom');
        done();
      }
    });
    store.load();
  });

  it('create() appends to list on success', (done) => {
    api.list.and.returnValue(of([addr('a1')]));
    api.create.and.returnValue(of(addr('a2')));
    store.load();

    store.create({ label: 'x' } as any).subscribe(() => {
      store.data$.subscribe((d) => {
        if (d && d.length === 2) {
          expect(d.map((x) => x.id)).toEqual(['a1', 'a2']);
          done();
        }
      });
    });
  });

  it('update() replaces the matching entry', (done) => {
    api.list.and.returnValue(of([addr('a1'), addr('a2')]));
    api.update.and.returnValue(of(addr('a2', { label: 'renamed' })));
    store.load();

    store.update('a2', { label: 'renamed' }).subscribe(() => {
      store.data$.subscribe((d) => {
        const hit = d?.find((x) => x.id === 'a2');
        if (hit && hit.label === 'renamed') done();
      });
    });
  });

  it('update() on a default re-flags siblings locally', (done) => {
    api.list.and.returnValue(
      of([addr('a1', { isDefaultShipping: true }), addr('a2')]),
    );
    api.update.and.returnValue(of(addr('a2', { isDefaultShipping: true })));
    store.load();

    store.update('a2', { isDefaultShipping: true }).subscribe(() => {
      store.data$.subscribe((d) => {
        if (d) {
          const a1 = d.find((x) => x.id === 'a1')!;
          const a2 = d.find((x) => x.id === 'a2')!;
          if (!a1.isDefaultShipping && a2.isDefaultShipping) done();
        }
      });
    });
  });

  it('remove() drops the entry', (done) => {
    api.list.and.returnValue(of([addr('a1'), addr('a2')]));
    api.delete.and.returnValue(of(undefined));
    store.load();

    store.remove('a1').subscribe(() => {
      store.data$.subscribe((d) => {
        if (d && d.length === 1 && d[0].id === 'a2') done();
      });
    });
  });

  it('load() falls back to translation key when error has no message', async () => {
    api.list.and.returnValue(throwError(() => ({})));
    store.load();
    await new Promise((r) => setTimeout(r, 0));

    const error = await firstValueFrom(store.error$);
    expect(error).toBe('ADDRESSES.LOAD_ERROR');
  });

  it('defaultShipping$ emits the default shipping address', async () => {
    api.list.and.returnValue(
      of([addr('a1'), addr('a2', { isDefaultShipping: true })]),
    );
    store.load();

    const def = await firstValueFrom(store.defaultShipping$);
    expect(def?.id).toBe('a2');
  });

  it('defaultShipping$ emits null when none is default', async () => {
    api.list.and.returnValue(of([addr('a1'), addr('a2')]));
    store.load();

    const def = await firstValueFrom(store.defaultShipping$);
    expect(def).toBeNull();
  });

  it('defaultBilling$ emits the default billing address', async () => {
    api.list.and.returnValue(
      of([addr('a1', { isDefaultBilling: true }), addr('a2')]),
    );
    store.load();

    const def = await firstValueFrom(store.defaultBilling$);
    expect(def?.id).toBe('a1');
  });

  it('defaultBilling$ emits null when none is default', async () => {
    api.list.and.returnValue(of([addr('a1')]));
    store.load();

    const def = await firstValueFrom(store.defaultBilling$);
    expect(def).toBeNull();
  });

  it('findDuplicate returns matching address by normalized fields', async () => {
    const existing = addr('a1', {
      street: '  1 RUE  ',
      city: 'PARIS',
      postalCode: '75000',
      country: 'fr',
      recipientName: 'A',
      phone: '',
    });
    api.list.and.returnValue(of([existing]));
    store.load();
    await firstValueFrom(store.data$);

    const dup = store.findDuplicate({
      label: 'whatever',
      recipientName: 'a',
      street: '1 rue',
      city: 'paris',
      postalCode: '75000',
      country: 'FR',
      isDefaultShipping: false,
      isDefaultBilling: false,
    });

    expect(dup?.id).toBe('a1');
  });

  it('findDuplicate returns null when no match', async () => {
    api.list.and.returnValue(of([addr('a1')]));
    store.load();
    await firstValueFrom(store.data$);

    const dup = store.findDuplicate({
      label: 'x',
      recipientName: 'B',
      street: 'different',
      city: 'Lyon',
      postalCode: '69000',
      country: 'FR',
      isDefaultShipping: false,
      isDefaultBilling: false,
    });

    expect(dup).toBeNull();
  });

  it('findDuplicate works when state.data is null', () => {
    const dup = store.findDuplicate({
      label: 'x',
      recipientName: 'A',
      street: 'x',
      city: 'x',
      postalCode: 'x',
      country: 'FR',
      isDefaultShipping: false,
      isDefaultBilling: false,
    });
    expect(dup).toBeNull();
  });

  it('createIfNotDuplicate returns existing on duplicate without calling API', async () => {
    const existing = addr('a1');
    api.list.and.returnValue(of([existing]));
    store.load();
    await firstValueFrom(store.data$);

    const result = await firstValueFrom(
      store.createIfNotDuplicate({
        label: 'a1',
        recipientName: 'A',
        street: '1 rue',
        city: 'Paris',
        postalCode: '75000',
        country: 'FR',
        isDefaultShipping: false,
        isDefaultBilling: false,
      }),
    );

    expect(result.id).toBe('a1');
    expect(api.create).not.toHaveBeenCalled();
  });

  it('createIfNotDuplicate creates address when no duplicate', async () => {
    api.list.and.returnValue(of([]));
    api.create.and.returnValue(of(addr('a2')));
    store.load();
    await firstValueFrom(store.data$);

    const result = await firstValueFrom(
      store.createIfNotDuplicate({
        label: 'new',
        recipientName: 'A',
        street: 'new street',
        city: 'Paris',
        postalCode: '75000',
        country: 'FR',
        isDefaultShipping: false,
        isDefaultBilling: false,
      }),
    );

    expect(result.id).toBe('a2');
    expect(api.create).toHaveBeenCalled();
  });

  it('reapplyDefaults flips billing siblings off when two are default-billing', async () => {
    api.list.and.returnValue(
      of([addr('a1', { isDefaultBilling: true }), addr('a2')]),
    );
    api.update.and.returnValue(of(addr('a2', { isDefaultBilling: true })));
    store.load();
    await firstValueFrom(store.data$);

    await firstValueFrom(store.update('a2', { isDefaultBilling: true }));

    const data = await firstValueFrom(store.data$);
    const a1 = data?.find((x) => x.id === 'a1');
    const a2 = data?.find((x) => x.id === 'a2');
    expect(a1?.isDefaultBilling).toBeFalse();
    expect(a2?.isDefaultBilling).toBeTrue();
  });

  it('create() works when state.data is null (no previous load)', async () => {
    api.create.and.returnValue(of(addr('a1')));

    const created = await firstValueFrom(
      store.create({
        label: 'a1',
        recipientName: 'A',
        street: '1 rue',
        city: 'Paris',
        postalCode: '75000',
        country: 'FR',
        isDefaultShipping: false,
        isDefaultBilling: false,
      }),
    );

    expect(created.id).toBe('a1');
    const data = await firstValueFrom(store.data$);
    expect(data?.length).toBe(1);
  });

  it('update() and remove() leave list intact when data is null', async () => {
    api.update.and.returnValue(of(addr('a1')));
    await firstValueFrom(store.update('a1', { label: 'x' }));
    let data = await firstValueFrom(store.data$);
    expect(data).toEqual([]);

    api.delete.and.returnValue(of(undefined));
    await firstValueFrom(store.remove('a1'));
    data = await firstValueFrom(store.data$);
    expect(data).toEqual([]);
  });
});
