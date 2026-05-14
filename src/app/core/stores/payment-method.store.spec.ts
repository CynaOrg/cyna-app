import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { PaymentMethodStore } from './payment-method.store';
import { PaymentMethodService } from '@core/services/payment-method.service';
import { PaymentMethod } from '@core/interfaces/payment-method.interface';

describe('PaymentMethodStore', () => {
  let store: PaymentMethodStore;
  let svc: jasmine.SpyObj<PaymentMethodService>;

  const items: PaymentMethod[] = [
    { id: 'pm_1' } as PaymentMethod,
    { id: 'pm_2' } as PaymentMethod,
  ];

  beforeEach(() => {
    svc = jasmine.createSpyObj('PaymentMethodService', ['list', 'remove']);
    TestBed.configureTestingModule({
      providers: [
        PaymentMethodStore,
        { provide: PaymentMethodService, useValue: svc },
      ],
    });
    store = TestBed.inject(PaymentMethodStore);
  });

  it('creates', () => expect(store).toBeTruthy());

  it('load() fills data on success', async () => {
    svc.list.and.returnValue(of(items));
    store.load();
    expect(await firstValueFrom(store.data$)).toEqual(items);
  });

  it('load() exposes error on failure', async () => {
    svc.list.and.returnValue(throwError(() => ({ message: 'oops' })));
    store.load();
    expect(await firstValueFrom(store.error$)).toBe('oops');
  });

  it('remove() drops the matching id from data', async () => {
    svc.list.and.returnValue(of(items));
    svc.remove.and.returnValue(of(undefined));
    store.load();
    await firstValueFrom(store.remove('pm_1'));
    expect(await firstValueFrom(store.data$)).toEqual([items[1]]);
  });

  it('remove() handles missing data gracefully', async () => {
    svc.remove.and.returnValue(of(undefined));
    await firstValueFrom(store.remove('pm_1'));
    expect(await firstValueFrom(store.data$)).toEqual([]);
  });
});
