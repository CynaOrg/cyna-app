import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { SubscriptionStore } from './subscription.store';
import { SubscriptionApiService } from '../services/subscription-api.service';
import { Subscription } from '../interfaces';

describe('SubscriptionStore', () => {
  let store: SubscriptionStore;
  let api: jasmine.SpyObj<SubscriptionApiService>;

  const subs: Subscription[] = [
    { id: 's1', status: 'active' } as Subscription,
    { id: 's2', status: 'canceled' } as Subscription,
  ];

  beforeEach(() => {
    api = jasmine.createSpyObj('SubscriptionApiService', [
      'getSubscriptions',
      'cancelSubscription',
    ]);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        SubscriptionStore,
        { provide: SubscriptionApiService, useValue: api },
      ],
    });
    store = TestBed.inject(SubscriptionStore);
  });

  it('creates', () => {
    expect(store).toBeTruthy();
  });

  it('loadSubscriptions populates subscriptions$ on success', async () => {
    api.getSubscriptions.and.returnValue(of(subs));
    store.loadSubscriptions();
    expect(await firstValueFrom(store.subscriptions$)).toEqual(subs);
    expect(await firstValueFrom(store.isLoading$)).toBeFalse();
  });

  it('loadSubscriptions surfaces server message on error', fakeAsync(() => {
    api.getSubscriptions.and.returnValue(
      throwError(() => ({ error: { message: 'down' } })),
    );
    store.loadSubscriptions();
    tick();
    const errs: (string | null)[] = [];
    store.error$.subscribe((e) => errs.push(e));
    const err = errs[errs.length - 1];
    expect(err).toBe('down');
  }));

  it('loadSubscriptions falls back to translation key', fakeAsync(() => {
    api.getSubscriptions.and.returnValue(throwError(() => ({})));
    store.loadSubscriptions();
    tick();
    const errs: (string | null)[] = [];
    store.error$.subscribe((e) => errs.push(e));
    const err = errs[errs.length - 1];
    expect(err).toBeTruthy();
  }));

  it('cancelSubscription reloads after success', () => {
    api.cancelSubscription.and.returnValue(of({ id: 's1' } as Subscription));
    api.getSubscriptions.and.returnValue(of(subs));
    store.cancelSubscription('s1');
    expect(api.cancelSubscription).toHaveBeenCalledWith('s1', true);
    expect(api.getSubscriptions).toHaveBeenCalled();
  });

  it('cancelSubscription respects cancelAtPeriodEnd=false', () => {
    api.cancelSubscription.and.returnValue(of({ id: 's1' } as Subscription));
    api.getSubscriptions.and.returnValue(of(subs));
    store.cancelSubscription('s1', false);
    expect(api.cancelSubscription).toHaveBeenCalledWith('s1', false);
  });

  it('cancelSubscription surfaces error', fakeAsync(() => {
    api.cancelSubscription.and.returnValue(
      throwError(() => ({ error: { message: 'cannot cancel' } })),
    );
    store.cancelSubscription('s1');
    tick();
    const errs: (string | null)[] = [];
    store.error$.subscribe((e) => errs.push(e));
    const err = errs[errs.length - 1];
    expect(err).toBe('cannot cancel');
  }));

  it('clear() empties subscriptions', async () => {
    api.getSubscriptions.and.returnValue(of(subs));
    store.loadSubscriptions();
    store.clear();
    expect(await firstValueFrom(store.subscriptions$)).toEqual([]);
  });
});
