import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  CheckoutApiService,
  CreatePaymentIntentRequest,
  ConfirmOrderRequest,
} from './checkout-api.service';
import { ApiService } from './api.service';
import { PaymentIntentResponse, Order } from '../interfaces';

describe('CheckoutApiService', () => {
  let service: CheckoutApiService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockPaymentIntent: PaymentIntentResponse = {
    clientSecret: 'pi_secret_123',
    paymentIntentId: 'pi_123',
    orderId: 'order-1',
    orderNumber: 'ORD-001',
    amount: 9999,
    currency: 'eur',
  };

  const mockOrder: Order = {
    id: 'order-1',
    orderNumber: 'ORD-001',
    userId: 'user-1',
    guestEmail: null,
    items: [],
    subtotal: 99.99,
    total: 99.99,
    status: 'paid',
    billingAddressSnapshot: {
      street: '1 rue de Paris',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    },
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        CheckoutApiService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });

    service = TestBed.inject(CheckoutApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create payment intent', () => {
    apiSpy.post.and.returnValue(of(mockPaymentIntent));

    const request: CreatePaymentIntentRequest = {
      cartId: 'cart-1',
      userId: 'user-1',
      billingAddress: {
        street: '1 rue de Paris',
        city: 'Paris',
        postalCode: '75001',
        country: 'FR',
      },
    };

    service.createPaymentIntent(request).subscribe((result) => {
      expect(result).toEqual(mockPaymentIntent);
    });

    expect(apiSpy.post).toHaveBeenCalledWith(
      'checkout/payment-intent',
      request,
    );
  });

  it('should confirm order', () => {
    apiSpy.post.and.returnValue(of(mockOrder));

    const request: ConfirmOrderRequest = {
      paymentIntentId: 'pi_123',
    };

    service.confirmOrder(request).subscribe((result) => {
      expect(result).toEqual(mockOrder);
    });

    expect(apiSpy.post).toHaveBeenCalledWith('checkout/confirm', request);
  });
});
