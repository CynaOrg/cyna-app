import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  SubscriptionApiService,
  CreateSubscriptionRequest,
} from './subscription-api.service';
import { ApiService } from './api.service';
import { Subscription, CreateSubscriptionResponse } from '../interfaces';

describe('SubscriptionApiService', () => {
  let service: SubscriptionApiService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockSubscription: Subscription = {
    id: 'sub-1',
    productId: 'prod-1',
    productName: 'EDR Pro',
    status: 'active',
    price: 49.99,
    billingPeriod: 'monthly',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
    cancelAtPeriodEnd: false,
  };

  const mockCreateResponse: CreateSubscriptionResponse = {
    clientSecret: 'cs_secret_123',
    subscriptionId: 'sub-1',
  };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'getList', 'post']);

    TestBed.configureTestingModule({
      providers: [
        SubscriptionApiService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });

    service = TestBed.inject(SubscriptionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get subscriptions', () => {
    apiSpy.getList.and.returnValue(of([mockSubscription]));

    service.getSubscriptions().subscribe((subs) => {
      expect(subs).toEqual([mockSubscription]);
    });

    expect(apiSpy.getList).toHaveBeenCalledWith('subscriptions');
  });

  it('should create subscription', () => {
    apiSpy.post.and.returnValue(of(mockCreateResponse));

    const request: CreateSubscriptionRequest = {
      productId: 'prod-1',
      billingPeriod: 'monthly',
      billingAddress: {
        street: '1 rue de Paris',
        city: 'Paris',
        postalCode: '75001',
        country: 'FR',
      },
    };

    service.createSubscription(request).subscribe((result) => {
      expect(result).toEqual(mockCreateResponse);
    });

    expect(apiSpy.post).toHaveBeenCalledWith('subscriptions', request);
  });

  it('should cancel subscription with default cancelAtPeriodEnd', () => {
    apiSpy.post.and.returnValue(
      of({ ...mockSubscription, cancelAtPeriodEnd: true }),
    );

    service.cancelSubscription('sub-1').subscribe((result) => {
      expect(result.cancelAtPeriodEnd).toBeTrue();
    });

    expect(apiSpy.post).toHaveBeenCalledWith('subscriptions/sub-1/cancel', {
      cancelAtPeriodEnd: true,
    });
  });

  it('should cancel subscription immediately', () => {
    apiSpy.post.and.returnValue(
      of({ ...mockSubscription, status: 'canceled' }),
    );

    service.cancelSubscription('sub-1', false).subscribe((result) => {
      expect(result.status).toBe('canceled');
    });

    expect(apiSpy.post).toHaveBeenCalledWith('subscriptions/sub-1/cancel', {
      cancelAtPeriodEnd: false,
    });
  });
});
