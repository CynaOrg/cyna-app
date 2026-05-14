import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { InvoiceStore } from './invoice.store';
import { InvoiceService } from '@core/services/invoice.service';
import { Invoice } from '@core/interfaces/invoice.interface';

describe('InvoiceStore', () => {
  let store: InvoiceStore;
  let svc: jasmine.SpyObj<InvoiceService>;

  const sample: Invoice[] = [{ id: 'i1' } as Invoice, { id: 'i2' } as Invoice];

  beforeEach(() => {
    svc = jasmine.createSpyObj('InvoiceService', ['list']);
    TestBed.configureTestingModule({
      providers: [InvoiceStore, { provide: InvoiceService, useValue: svc }],
    });
    store = TestBed.inject(InvoiceStore);
  });

  it('creates', () => expect(store).toBeTruthy());

  it('load() fills data on success', async () => {
    svc.list.and.returnValue(of(sample));
    store.load();
    expect(await firstValueFrom(store.data$)).toEqual(sample);
    expect(svc.list).toHaveBeenCalledWith(5);
  });

  it('load() honours the limit argument', () => {
    svc.list.and.returnValue(of([]));
    store.load(20);
    expect(svc.list).toHaveBeenCalledWith(20);
  });

  it('load() exposes error on failure', async () => {
    svc.list.and.returnValue(throwError(() => ({ message: 'down' })));
    store.load();
    expect(await firstValueFrom(store.error$)).toBe('down');
  });

  it('load() falls back to a generic error', async () => {
    svc.list.and.returnValue(throwError(() => ({})));
    store.load();
    expect(await firstValueFrom(store.error$)).toBe('Error');
  });
});
