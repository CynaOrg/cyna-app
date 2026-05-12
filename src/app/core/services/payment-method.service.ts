import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentMethod } from '@core/interfaces/payment-method.interface';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/billing/payment-methods`;

  list(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.baseUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 501 || err.status === 404)
          return of<PaymentMethod[]>([]);
        throw err;
      }),
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 501 || err.status === 404) return of(void 0);
        throw err;
      }),
    );
  }

  setDefault(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/default`, {}).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 501 || err.status === 404) return of(void 0);
        throw err;
      }),
    );
  }
}
