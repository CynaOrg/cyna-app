import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { License } from '../interfaces/license.interface';

@Injectable({
  providedIn: 'root',
})
export class LicenseApiService {
  private readonly api = inject(ApiService);

  getLicenses(): Observable<License[]> {
    return this.api.getList<License>('licenses');
  }

  getLicenseById(id: string): Observable<License> {
    return this.api.get<License>(`licenses/${id}`);
  }
}
