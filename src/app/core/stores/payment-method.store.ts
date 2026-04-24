import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BaseStore } from './base.store';
import { PaymentMethod } from '@core/interfaces/payment-method.interface';
import { PaymentMethodService } from '@core/services/payment-method.service';

@Injectable({ providedIn: 'root' })
export class PaymentMethodStore extends BaseStore<PaymentMethod[]> {
  private readonly service = inject(PaymentMethodService);

  load(): void {
    this.setLoading(true);
    this.service.list().subscribe({
      next: (methods) => {
        this.setData(methods);
      },
      error: (err) => {
        this.setError(err?.message ?? 'Error');
      },
    });
  }

  remove(id: string) {
    return this.service.remove(id).pipe(
      tap(() => {
        const current = this.state.data ?? [];
        this.setData(current.filter((m) => m.id !== id));
      }),
    );
  }
}
