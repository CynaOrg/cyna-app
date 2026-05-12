import { Injectable, inject } from '@angular/core';
import { BaseStore } from './base.store';
import { Invoice } from '@core/interfaces/invoice.interface';
import { InvoiceService } from '@core/services/invoice.service';

@Injectable({ providedIn: 'root' })
export class InvoiceStore extends BaseStore<Invoice[]> {
  private readonly service = inject(InvoiceService);

  load(limit = 5): void {
    this.setLoading(true);
    this.service.list(limit).subscribe({
      next: (invoices) => {
        this.setData(invoices);
      },
      error: (err) => {
        this.setError(err?.message ?? 'Error');
      },
    });
  }
}
