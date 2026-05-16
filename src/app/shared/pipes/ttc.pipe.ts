import { Pipe, PipeTransform } from '@angular/core';
import { toTtc } from '@core/constants/tax.constants';

/**
 * Convert an HT amount to TTC by applying the project VAT rate.
 * Usage: `{{ sub.price | ttc | number:'1.2-2' }}`
 *
 * Returns 0 for null/undefined/non-numeric inputs so templates don't have
 * to guard.
 */
@Pipe({
  name: 'ttc',
  standalone: true,
})
export class TtcPipe implements PipeTransform {
  transform(value: number | null | undefined): number {
    const ht = Number(value);
    if (!Number.isFinite(ht)) return 0;
    return toTtc(ht);
  }
}
