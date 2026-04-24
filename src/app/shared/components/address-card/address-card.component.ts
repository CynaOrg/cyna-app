import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserAddress } from '@core/interfaces/user-address.interface';

@Component({
  selector: 'app-address-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div
      data-test="card"
      class="flex flex-col gap-2 py-4 px-1 transition-colors"
      [class.bg-primary/5]="selected()"
      [class.cursor-pointer]="selectable()"
      (click)="onCardClick()"
    >
      <!-- Card header: label + badges -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2">
          @if (selectable()) {
            <input
              type="radio"
              [checked]="selected()"
              [name]="'address-' + (address()?.id ?? '')"
              class="accent-primary"
              (click)="$event.stopPropagation(); onCardClick()"
            />
          }
          <h4 class="text-sm font-semibold text-text-primary">
            {{ address()?.label }}
          </h4>
        </div>

        <div class="flex flex-wrap gap-1">
          @if (address()?.isDefaultShipping) {
            <span
              class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {{ 'ADDRESSES.DEFAULT_SHIPPING' | translate }}
            </span>
          }
          @if (address()?.isDefaultBilling) {
            <span
              class="inline-flex items-center gap-1 rounded-full bg-text-secondary/10 px-2 py-0.5 text-xs font-medium text-text-secondary"
            >
              {{ 'ADDRESSES.DEFAULT_BILLING' | translate }}
            </span>
          }
        </div>
      </div>

      <!-- Address body -->
      <p class="text-sm text-text-primary">{{ address()?.recipientName }}</p>
      <p class="text-sm text-text-secondary">
        {{ address()?.street }}
        @if (address()?.streetLine2) {
          {{ address()?.streetLine2 }}
        }
      </p>
      <p class="text-sm text-text-secondary">
        {{ address()?.postalCode }} {{ address()?.city }}
      </p>
      <p class="text-sm text-text-secondary">
        @if (address()?.state) {
          {{ address()?.state }},
        }
        {{ address()?.country }}
      </p>

      <!-- Actions -->
      @if (showActions()) {
        <div
          class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-light pt-2"
        >
          <button
            type="button"
            class="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            (click)="$event.stopPropagation(); edit.emit(address()!.id)"
          >
            {{ 'ADDRESSES.EDIT' | translate }}
          </button>
          <span class="text-border-light select-none">·</span>
          <button
            type="button"
            class="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
            (click)="
              $event.stopPropagation(); deleteAddress.emit(address()!.id)
            "
          >
            {{ 'ADDRESSES.DELETE' | translate }}
          </button>
          @if (!address()?.isDefaultShipping) {
            <span class="text-border-light select-none">·</span>
            <button
              type="button"
              class="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              (click)="
                $event.stopPropagation(); setDefaultShipping.emit(address()!.id)
              "
            >
              {{ 'ADDRESSES.SET_DEFAULT_SHIPPING' | translate }}
            </button>
          }
          @if (!address()?.isDefaultBilling) {
            <span class="text-border-light select-none">·</span>
            <button
              type="button"
              class="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              (click)="
                $event.stopPropagation(); setDefaultBilling.emit(address()!.id)
              "
            >
              {{ 'ADDRESSES.SET_DEFAULT_BILLING' | translate }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class AddressCardComponent {
  address = input<UserAddress | null>(null);
  selectable = input<boolean>(false);
  selected = input<boolean>(false);
  showActions = input<boolean>(false);

  cardSelect = output<string>();
  edit = output<string>();
  deleteAddress = output<string>();
  setDefaultShipping = output<string>();
  setDefaultBilling = output<string>();

  onCardClick(): void {
    if (!this.selectable()) return;
    const a = this.address();
    if (a) this.cardSelect.emit(a.id);
  }
}
