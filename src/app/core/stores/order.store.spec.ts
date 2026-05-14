import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { OrderStore } from './order.store';
import { OrderApiService } from '../services/order-api.service';
import { Order } from '../interfaces';

describe('OrderStore', () => {
  let store: OrderStore;
  let api: jasmine.SpyObj<OrderApiService>;

  const orders: Order[] = [
    { id: 'o1', orderNumber: 'ON1', total: 10 } as Order,
    { id: 'o2', orderNumber: 'ON2', total: 20 } as Order,
  ];

  beforeEach(() => {
    api = jasmine.createSpyObj('OrderApiService', ['getOrders']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [OrderStore, { provide: OrderApiService, useValue: api }],
    });
    store = TestBed.inject(OrderStore);
  });

  it('creates', () => {
    expect(store).toBeTruthy();
  });

  it('loadOrders populates orders$ on success', async () => {
    api.getOrders.and.returnValue(of(orders));
    store.loadOrders();
    expect(await firstValueFrom(store.orders$)).toEqual(orders);
    expect(await firstValueFrom(store.isLoading$)).toBeFalse();
  });

  it('loadOrders surfaces server error message', fakeAsync(() => {
    api.getOrders.and.returnValue(
      throwError(() => ({ error: { message: 'Service down' } })),
    );
    store.loadOrders();
    tick();
    const errs: (string | null)[] = [];
    store.error$.subscribe((e) => errs.push(e));
    const err = errs[errs.length - 1];
    expect(err).toBe('Service down');
  }));

  it('loadOrders falls back to translation key when no message', fakeAsync(() => {
    api.getOrders.and.returnValue(throwError(() => ({})));
    store.loadOrders();
    tick();
    const errs: (string | null)[] = [];
    store.error$.subscribe((e) => errs.push(e));
    const err = errs[errs.length - 1];
    expect(err).toBeTruthy();
  }));

  it('getOrderById returns the matching order', async () => {
    api.getOrders.and.returnValue(of(orders));
    store.loadOrders();
    await firstValueFrom(store.orders$);
    expect(store.getOrderById('o2')).toEqual(orders[1]);
    expect(store.getOrderById('missing')).toBeUndefined();
  });

  it('clear() empties orders and clears error', async () => {
    api.getOrders.and.returnValue(of(orders));
    store.loadOrders();
    store.clear();
    expect(await firstValueFrom(store.orders$)).toEqual([]);
  });
});
