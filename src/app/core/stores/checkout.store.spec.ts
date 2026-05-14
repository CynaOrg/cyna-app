import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { CheckoutStore } from './checkout.store';
import { CheckoutApiService } from '../services/checkout-api.service';
import { Address } from '../interfaces';

describe('CheckoutStore', () => {
  let store: CheckoutStore;
  let api: jasmine.SpyObj<CheckoutApiService>;

  const billingAddress: Address = {
    street: '1 rue de Paris',
    city: 'Paris',
    postalCode: '75001',
    country: 'FR',
  };

  beforeEach(() => {
    api = jasmine.createSpyObj('CheckoutApiService', ['createPaymentIntent']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        CheckoutStore,
        { provide: CheckoutApiService, useValue: api },
      ],
    });
    store = TestBed.inject(CheckoutStore);
  });

  it('creates', () => {
    expect(store).toBeTruthy();
    expect(store.state.email).toBe('');
    expect(store.state.billingAddress).toBeNull();
  });

  it('setEmail updates state', async () => {
    store.setEmail('a@b.fr');
    expect(await firstValueFrom(store.email$)).toBe('a@b.fr');
  });

  it('setBillingAddress and setShippingAddress update state', () => {
    store.setBillingAddress(billingAddress);
    expect(store.state.billingAddress).toEqual(billingAddress);
    store.setShippingAddress(billingAddress);
    expect(store.state.shippingAddress).toEqual(billingAddress);
    store.setShippingAddress(null);
    expect(store.state.shippingAddress).toBeNull();
  });

  it('createPaymentIntent emits error when billing missing', () => {
    store.createPaymentIntent('cart-1');
    expect(store.state.error).toBeTruthy();
    expect(api.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('createPaymentIntent emits error when email missing', () => {
    store.setBillingAddress(billingAddress);
    store.createPaymentIntent('cart-1');
    expect(store.state.error).toBeTruthy();
    expect(api.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('createPaymentIntent fills state with API response', fakeAsync(() => {
    api.createPaymentIntent.and.returnValue(
      of({
        clientSecret: 'cs_123',
        paymentIntentId: 'pi_123',
        orderId: 'order-1',
        orderNumber: 'ON-1',
        amount: 1000,
        currency: 'eur',
      }),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();
    expect(store.state.clientSecret).toBe('cs_123');
    expect(store.state.paymentIntentId).toBe('pi_123');
    expect(store.state.orderId).toBe('order-1');
    expect(store.state.orderNumber).toBe('ON-1');
    expect(store.state.isLoading).toBeFalse();
    expect(store.state.error).toBeNull();
  }));

  it('createPaymentIntent surfaces server error message', fakeAsync(() => {
    api.createPaymentIntent.and.returnValue(
      throwError(() => ({ error: { error: { message: 'Server down' } } })),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();
    expect(store.state.error).toBe('Server down');
    expect(store.state.isLoading).toBeFalse();
  }));

  it('createPaymentIntent falls back to translation key on unknown error', fakeAsync(() => {
    api.createPaymentIntent.and.returnValue(throwError(() => ({})));
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();
    expect(store.state.error).toBeTruthy();
  }));

  it('reset() restores INITIAL_STATE', () => {
    store.setEmail('a@b.fr');
    store.setBillingAddress(billingAddress);
    store.reset();
    expect(store.state.email).toBe('');
    expect(store.state.billingAddress).toBeNull();
  });

  it('exposes email$ observable reflecting state updates', async () => {
    store.setEmail('user@cyna.fr');
    const value = await firstValueFrom(store.email$);
    expect(value).toBe('user@cyna.fr');
  });

  it('exposes clientSecret$ and paymentIntentId$ after createPaymentIntent', fakeAsync(async () => {
    api.createPaymentIntent.and.returnValue(
      of({
        clientSecret: 'cs_abc',
        paymentIntentId: 'pi_abc',
        orderId: 'order-x',
        orderNumber: 'ORD-X',
        amount: 5000,
        currency: 'eur',
      }),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();

    expect(await firstValueFrom(store.clientSecret$)).toBe('cs_abc');
    expect(await firstValueFrom(store.paymentIntentId$)).toBe('pi_abc');
  }));

  it('isLoading$ flips true during createPaymentIntent and back to false', fakeAsync(() => {
    const states: boolean[] = [];
    store.isLoading$.subscribe((v) => states.push(v));

    api.createPaymentIntent.and.returnValue(
      of({
        clientSecret: 'cs_1',
        paymentIntentId: 'pi_1',
        orderId: 'o',
        orderNumber: 'N',
        amount: 1,
        currency: 'eur',
      }),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();

    expect(states).toContain(true);
    expect(states[states.length - 1]).toBeFalse();
  }));

  it('uses english preferredLanguage when current lang is en', fakeAsync(() => {
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    api.createPaymentIntent.and.returnValue(
      of({
        clientSecret: 'cs',
        paymentIntentId: 'pi',
        orderId: 'o',
        orderNumber: 'N',
        amount: 1,
        currency: 'eur',
      }),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();

    const call = api.createPaymentIntent.calls.mostRecent();
    expect(call.args[0].preferredLanguage).toBe('en');
  }));

  it('defaults to french preferredLanguage when no lang is set', fakeAsync(() => {
    api.createPaymentIntent.and.returnValue(
      of({
        clientSecret: 'cs',
        paymentIntentId: 'pi',
        orderId: 'o',
        orderNumber: 'N',
        amount: 1,
        currency: 'eur',
      }),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();

    const call = api.createPaymentIntent.calls.mostRecent();
    expect(call.args[0].preferredLanguage).toBe('fr');
  }));

  it('passes shippingAddress through to API when set', fakeAsync(() => {
    const shipping: Address = { ...billingAddress, city: 'Lyon' };
    api.createPaymentIntent.and.returnValue(
      of({
        clientSecret: 'cs',
        paymentIntentId: 'pi',
        orderId: 'o',
        orderNumber: 'N',
        amount: 1,
        currency: 'eur',
      }),
    );
    store.setBillingAddress(billingAddress);
    store.setShippingAddress(shipping);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();

    const call = api.createPaymentIntent.calls.mostRecent();
    expect(call.args[0].shippingAddress).toEqual(shipping);
  }));

  it('omits shippingAddress when null', fakeAsync(() => {
    api.createPaymentIntent.and.returnValue(
      of({
        clientSecret: 'cs',
        paymentIntentId: 'pi',
        orderId: 'o',
        orderNumber: 'N',
        amount: 1,
        currency: 'eur',
      }),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();

    const call = api.createPaymentIntent.calls.mostRecent();
    expect(call.args[0].shippingAddress).toBeUndefined();
  }));

  it('prefers outer error.message when no inner error.error.message', fakeAsync(() => {
    api.createPaymentIntent.and.returnValue(
      throwError(() => ({ error: { message: 'Outer error' } })),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();
    expect(store.state.error).toBe('Outer error');
  }));

  it('falls back to err.message when no error.error structure', fakeAsync(() => {
    api.createPaymentIntent.and.returnValue(
      throwError(() => ({ message: 'Raw error' })),
    );
    store.setBillingAddress(billingAddress);
    store.setEmail('a@b.fr');
    store.createPaymentIntent('cart-1');
    tick();
    expect(store.state.error).toBe('Raw error');
  }));
});
