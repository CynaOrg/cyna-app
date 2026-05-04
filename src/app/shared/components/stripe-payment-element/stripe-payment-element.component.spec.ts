import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { StripePaymentElementComponent } from './stripe-payment-element.component';
import { StripeService } from '@core/services/stripe.service';

interface MockElement {
  mount: jasmine.Spy;
  on: jasmine.Spy;
  destroy: jasmine.Spy;
}

function makeMockElement(): MockElement {
  return {
    mount: jasmine.createSpy('mount'),
    on: jasmine.createSpy('on'),
    destroy: jasmine.createSpy('destroy'),
  };
}

describe('StripePaymentElementComponent', () => {
  let fixture: ComponentFixture<StripePaymentElementComponent>;
  let component: StripePaymentElementComponent;
  let cardNumberEl: MockElement;
  let cardExpiryEl: MockElement;
  let cardCvcEl: MockElement;
  let prbEl: MockElement;
  let paymentRequestSpy: {
    canMakePayment: jasmine.Spy;
    on: jasmine.Spy;
  };
  let canMakePaymentResult: unknown;
  let elementsCreateSpy: jasmine.Spy;
  let stripeMock: { elements: jasmine.Spy; paymentRequest: jasmine.Spy };

  function setupStripeMock() {
    cardNumberEl = makeMockElement();
    cardExpiryEl = makeMockElement();
    cardCvcEl = makeMockElement();
    prbEl = makeMockElement();

    elementsCreateSpy = jasmine
      .createSpy('elements.create')
      .and.callFake((type: string) => {
        switch (type) {
          case 'cardNumber':
            return cardNumberEl;
          case 'cardExpiry':
            return cardExpiryEl;
          case 'cardCvc':
            return cardCvcEl;
          case 'paymentRequestButton':
            return prbEl;
          default:
            return makeMockElement();
        }
      });

    paymentRequestSpy = {
      canMakePayment: jasmine
        .createSpy('canMakePayment')
        .and.callFake(() => Promise.resolve(canMakePaymentResult)),
      on: jasmine.createSpy('paymentRequest.on'),
    };

    stripeMock = {
      elements: jasmine.createSpy('elements').and.returnValue({
        create: elementsCreateSpy,
      }),
      paymentRequest: jasmine
        .createSpy('paymentRequest')
        .and.returnValue(paymentRequestSpy),
    };
  }

  async function createComponent(inputs: {
    clientSecret: string;
    amount?: number | null;
  }) {
    fixture = TestBed.createComponent(StripePaymentElementComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('clientSecret', inputs.clientSecret);
    if (inputs.amount !== undefined) {
      fixture.componentRef.setInput('amount', inputs.amount);
    }
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    setupStripeMock();
    canMakePaymentResult = null;

    await TestBed.configureTestingModule({
      imports: [StripePaymentElementComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: StripeService,
          useValue: {
            getStripe: () => Promise.resolve(stripeMock),
          },
        },
      ],
    }).compileComponents();
  });

  it('mounts the three split card elements on init', async () => {
    await createComponent({ clientSecret: 'cs_test_123', amount: null });
    expect(elementsCreateSpy).toHaveBeenCalledWith(
      'cardNumber',
      jasmine.any(Object),
    );
    expect(elementsCreateSpy).toHaveBeenCalledWith(
      'cardExpiry',
      jasmine.any(Object),
    );
    expect(elementsCreateSpy).toHaveBeenCalledWith(
      'cardCvc',
      jasmine.any(Object),
    );
    expect(cardNumberEl.mount).toHaveBeenCalled();
  });

  it('does not initialize PaymentRequestButton when amount is null', async () => {
    canMakePaymentResult = { applePay: true };
    await createComponent({ clientSecret: 'cs_1', amount: null });
    expect(stripeMock.paymentRequest).not.toHaveBeenCalled();
    expect(component.walletAvailable()).toBeFalse();
  });

  it('does not render the wallet button when canMakePayment returns null', async () => {
    canMakePaymentResult = null;
    await createComponent({ clientSecret: 'cs_2', amount: 1999 });
    expect(stripeMock.paymentRequest).toHaveBeenCalled();
    expect(paymentRequestSpy.canMakePayment).toHaveBeenCalled();
    expect(component.walletAvailable()).toBeFalse();
    expect(elementsCreateSpy).not.toHaveBeenCalledWith(
      'paymentRequestButton',
      jasmine.any(Object),
    );
  });

  it('mounts the wallet button when a wallet is available', async () => {
    canMakePaymentResult = { applePay: true };
    await createComponent({ clientSecret: 'cs_3', amount: 5000 });
    expect(component.walletAvailable()).toBeTrue();
    expect(elementsCreateSpy).toHaveBeenCalledWith(
      'paymentRequestButton',
      jasmine.any(Object),
    );
    expect(prbEl.mount).toHaveBeenCalled();
  });

  it('passes amount and currency to stripe.paymentRequest', async () => {
    canMakePaymentResult = { applePay: true };
    await createComponent({ clientSecret: 'cs_4', amount: 12345 });
    const config = stripeMock.paymentRequest.calls.mostRecent().args[0];
    expect(config.currency).toBe('eur');
    expect(config.country).toBe('FR');
    expect(config.total.amount).toBe(12345);
    expect(config.total.label).toBe('CYNA');
  });

  it('exposes a non-empty walletOrder list', () => {
    fixture = TestBed.createComponent(StripePaymentElementComponent);
    component = fixture.componentInstance;
    expect(component.walletOrder.length).toBeGreaterThan(0);
    // Either apple_pay or card must lead, depending on the test runner's UA.
    expect(['apple_pay', 'card']).toContain(component.walletOrder[0]);
  });

  it('survives wallet init failure without breaking the card form', async () => {
    paymentRequestSpy.canMakePayment.and.callFake(() =>
      Promise.reject(new Error('boom')),
    );
    canMakePaymentResult = null;
    await createComponent({ clientSecret: 'cs_5', amount: 1000 });
    expect(component.walletAvailable()).toBeFalse();
    expect(cardNumberEl.mount).toHaveBeenCalled();
  });

  it('destroys all elements on ngOnDestroy', async () => {
    canMakePaymentResult = { applePay: true };
    await createComponent({ clientSecret: 'cs_6', amount: 1000 });
    component.ngOnDestroy();
    expect(cardNumberEl.destroy).toHaveBeenCalled();
    expect(cardExpiryEl.destroy).toHaveBeenCalled();
    expect(cardCvcEl.destroy).toHaveBeenCalled();
    expect(prbEl.destroy).toHaveBeenCalled();
  });
});
