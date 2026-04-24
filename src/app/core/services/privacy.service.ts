import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export type DataExportResult =
  | { status: 'pending' }
  | { status: 'unavailable' };

@Injectable({ providedIn: 'root' })
export class PrivacyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/users/me`;

  requestDataExport(): Observable<DataExportResult> {
    return this.http
      .post<DataExportResult>(`${this.baseUrl}/data-export`, {})
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 501 || err.status === 404) {
            return of<DataExportResult>({ status: 'unavailable' });
          }
          throw err;
        }),
      );
  }
}
