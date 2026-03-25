import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrderApiService } from './order-api.service';
import { ApiService } from './api.service';
import { Order } from '../interfaces';

describe('OrderApiService', () => {
  let service: OrderApiService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockOrder: Order = {
    id: 'order-1',
    orderNumber: 'ORD-001',
    userId: 'user-1',
    guestEmail: null,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productSnapshot: { name: 'EDR Pro' },
        quantity: 1,
        unitPrice: 99.99,
        totalPrice: 99.99,
      },
    ],
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
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'getList']);

    TestBed.configureTestingModule({
      providers: [OrderApiService, { provide: ApiService, useValue: apiSpy }],
    });

    service = TestBed.inject(OrderApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get orders', () => {
    apiSpy.getList.and.returnValue(of([mockOrder]));

    service.getOrders().subscribe((orders) => {
      expect(orders).toEqual([mockOrder]);
    });

    expect(apiSpy.getList).toHaveBeenCalledWith('orders');
  });

  it('should get order by id', () => {
    apiSpy.get.and.returnValue(of(mockOrder));

    service.getOrderById('order-1').subscribe((order) => {
      expect(order).toEqual(mockOrder);
    });

    expect(apiSpy.get).toHaveBeenCalledWith('orders/order-1');
  });
});
