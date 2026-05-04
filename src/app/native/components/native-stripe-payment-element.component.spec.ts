import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StripeService } from '@core/services/stripe.service';
import { NativeStripePaymentElementComponent } from './native-stripe-payment-element.component';

interface FakeElement {
  on: jasmine.Spy;
  mount: jasmine.Spy;
  destroy: jasmine.Spy;
}

function makeFakeElement(): FakeElement {
  return {
    on: jasmine.createSpy('on'),
    mount: jasmine.createSpy('mount'),
    destroy: jasmine.createSpy('destroy'),
  };
}

describe('NativeStripePaymentElementComponent', () => {
  let fixture: ComponentFixture<NativeStripePaymentElementComponent>;
  let component: NativeStripePaymentElementComponent;
  let stripe: any;
  let elements: any;
  let paymentElement: FakeElement;
  let prButton: FakeElement;
  let paymentRequest: any;

  beforeEach(async () => {
    paymentElement = makeFakeElement();
    prButton = makeFakeElement();
    paymentRequest = {
      canMakePayment: jasmine
        .createSpy('canMakePayment')
        .and.resolveTo({ applePay: true }),
      on: jasmine.createSpy('on'),
    };
    elements = {
      create: jasmine.createSpy('create').and.callFake((type: string) => {
        if (type === 'paymentRequestButton') return prButton;
        return paymentElement;
      }),
    };
    stripe = {
      elements: jasmine.createSpy('elements').and.returnValue(elements),
      paymentRequest: jasmine
        .createSpy('paymentRequest')
        .and.returnValue(paymentRequest),
      confirmPayment: jasmine
        .createSpy('confirmPayment')
        .and.resolveTo({ error: undefined }),
      confirmCardPayment: jasmine
        .createSpy('confirmCardPayment')
        .and.resolveTo({ error: undefined }),
    };

    const stripeService = jasmine.createSpyObj<StripeService>('StripeService', [
      'getStripe',
    ]);
    stripeService.getStripe.and.resolveTo(stripe);

    await TestBed.configureTestingModule({
      imports: [
        NativeStripePaymentElementComponent,
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: StripeService, useValue: stripeService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NativeStripePaymentElementComponent);
    fixture.componentRef.setInput('clientSecret', 'cs_test_123');
    fixture.componentRef.setInput('amount', 12000);
    fixture.componentRef.setInput('currency', 'eur');
    fixture.componentRef.setInput('country', 'FR');
    component = fixture.componentInstance;
  });

  it('initialises Stripe Elements with the provided client secret', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(stripe.elements).toHaveBeenCalledWith(
      jasmine.objectContaining({ clientSecret: 'cs_test_123' }),
    );
    expect(elements.create).toHaveBeenCalledWith(
      'payment',
      jasmine.objectContaining({ layout: 'tabs' }),
    );
    expect(paymentElement.mount).toHaveBeenCalled();
  });

  it('shows the wallet button when payment request is supported', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(stripe.paymentRequest).toHaveBeenCalled();
    expect(component.showWalletButton()).toBeTrue();
  });

  it('hides wallet button when payment request is not supported', async () => {
    paymentRequest.canMakePayment.and.resolveTo(null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.showWalletButton()).toBeFalse();
  });

  it('returns success on submit when Stripe confirms without error', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const result = await component.submit();
    expect(stripe.confirmPayment).toHaveBeenCalled();
    expect(result.success).toBeTrue();
  });

  it('returns failure and emits paymentError when confirm errors', async () => {
    stripe.confirmPayment.and.resolveTo({
      error: { message: 'Declined' },
    });
    const errorSpy = jasmine.createSpy('error');
    fixture.detectChanges();
    await fixture.whenStable();
    component.paymentError.subscribe(errorSpy);
    const result = await component.submit();
    expect(result.success).toBeFalse();
    expect(result.error).toBe('Declined');
    expect(errorSpy).toHaveBeenCalledWith('Declined');
  });

  it('fails gracefully when Stripe fails to load', async () => {
    const stripeService = TestBed.inject(StripeService) as jasmine.SpyObj<StripeService>;
    stripeService.getStripe.and.resolveTo(null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.errorMessage()).toBe('Failed to load Stripe');
  });
});
