import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
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
});
