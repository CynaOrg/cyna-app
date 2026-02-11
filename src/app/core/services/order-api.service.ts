import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  private readonly api = inject(ApiService);

  getOrders(): Observable<Order[]> {
    return this.api.getList<Order>('orders');
  }

  getOrderById(id: string): Observable<Order> {
    return this.api.get<Order>(`orders/${id}`);
  }
}
