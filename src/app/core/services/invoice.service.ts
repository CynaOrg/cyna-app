import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Invoice } from '@core/interfaces/invoice.interface';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/billing/invoices`;

  list(limit = 5): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}?limit=${limit}`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 501 || err.status === 404) return of<Invoice[]>([]);
        throw err;
      }),
    );
  }
}
