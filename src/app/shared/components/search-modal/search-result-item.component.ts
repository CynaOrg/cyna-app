import { Component, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorCloudArrowUp,
  phosphorPackage,
  phosphorKey,
  phosphorArrowRight,
} from '@ng-icons/phosphor-icons/regular';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '@core/interfaces/product.interface';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  imports: [NgIconComponent, TranslateModule],
  viewProviders: [
    provideIcons({
      phosphorCloudArrowUp,
      phosphorPackage,
      phosphorKey,
      phosphorArrowRight,
    }),
  ],
  host: { class: 'block' },
  template: `
    <button
      type="button"
      class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors"
      [class.bg-primary-light]="isActive()"
      [class.hover:bg-border-light]="!isActive()"
      (click)="selected.emit(product())"
    >
      @if (product().primaryImageUrl) {
        <img
          [src]="product().primaryImageUrl"
          [alt]="product().name"
          class="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      } @else {
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-border-light"
          style="color: #585858"
        >
          <ng-icon [name]="typeIcon()" size="20" />
        </div>
      }

      <div class="flex min-w-0 flex-1 flex-col">
        <span class="truncate text-sm font-medium" style="color: #0a0a0a">
          {{ product().name }}
        </span>
        <span class="truncate text-xs" style="color: #9ca3af">
          {{ product().categoryName || typeLabel() }}
        </span>
      </div>

      @if (price(); as p) {
        <span class="shrink-0 text-sm font-semibold" style="color: #4f39f6">
          {{ p }}
        </span>
      } @else {
        <span class="shrink-0 text-xs" style="color: #9ca3af">
          {{ 'PRODUCT.ON_QUOTE' | translate }}
        </span>
      }

      <ng-icon
        name="phosphorArrowRight"
        size="16"
        class="shrink-0 opacity-40"
      />
    </button>
  `,
})
export class SearchResultItemComponent {
  product = input.required<Product>();
  isActive = input<boolean>(false);
  selected = output<Product>();

  typeIcon = () => {
    const icons: Record<string, string> = {
      saas: 'phosphorCloudArrowUp',
      physical: 'phosphorPackage',
      license: 'phosphorKey',
    };
    return icons[this.product().productType] || 'phosphorPackage';
  };

  typeLabel = () => {
    const labels: Record<string, string> = {
      saas: 'Service',
      physical: 'Product',
      license: 'License',
    };
    return labels[this.product().productType] || '';
  };

  price = () => {
    const p = this.product();
    if (p.priceMonthly) return `${p.priceMonthly}€/mo`;
    if (p.priceUnit) return `${p.priceUnit}€`;
    return null;
  };
}
