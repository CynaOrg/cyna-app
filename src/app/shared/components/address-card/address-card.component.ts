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
      class="flex flex-col gap-1 rounded-lg border p-4 transition-colors"
      [class.border-gray-200]="!selected()"
      [class.border-black]="selected()"
      [class.bg-gray-50]="selected()"
      [class.cursor-pointer]="selectable()"
      (click)="onCardClick()"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          @if (selectable()) {
            <input
              type="radio"
              [checked]="selected()"
              [name]="'address-' + (address()?.id ?? '')"
              class="accent-black"
              (click)="$event.stopPropagation(); onCardClick()"
            />
          }
          <h4 class="text-sm font-semibold text-black">
            {{ address()?.label }}
          </h4>
        </div>

        <div class="flex flex-wrap gap-1">
          @if (address()?.isDefaultShipping) {
            <span
              class="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
            >
              {{ 'ADDRESSES.DEFAULT_SHIPPING' | translate }}
            </span>
          }
          @if (address()?.isDefaultBilling) {
            <span class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
              {{ 'ADDRESSES.DEFAULT_BILLING' | translate }}
            </span>
          }
        </div>
      </div>

      <p class="text-sm text-gray-800">{{ address()?.recipientName }}</p>
      <p class="text-sm text-gray-600">
        {{ address()?.street }}
        @if (address()?.streetLine2) {
          {{ address()?.streetLine2 }}
        }
      </p>
      <p class="text-sm text-gray-600">
        {{ address()?.postalCode }} {{ address()?.city }}
      </p>
      <p class="text-sm text-gray-600">
        @if (address()?.state) {
          {{ address()?.state }},
        }
        {{ address()?.country }}
      </p>

      @if (showActions()) {
        <div class="mt-2 flex gap-2">
          <button
            type="button"
            class="text-xs text-gray-700 underline"
            (click)="$event.stopPropagation(); edit.emit(address()!.id)"
          >
            {{ 'ADDRESSES.EDIT' | translate }}
          </button>
          <button
            type="button"
            class="text-xs text-red-700 underline"
            (click)="$event.stopPropagation(); delete.emit(address()!.id)"
          >
            {{ 'ADDRESSES.DELETE' | translate }}
          </button>
          @if (!address()?.isDefaultShipping) {
            <button
              type="button"
              class="text-xs text-green-700 underline"
              (click)="
                $event.stopPropagation(); setDefaultShipping.emit(address()!.id)
              "
            >
              {{ 'ADDRESSES.SET_DEFAULT_SHIPPING' | translate }}
            </button>
          }
          @if (!address()?.isDefaultBilling) {
            <button
              type="button"
              class="text-xs text-blue-700 underline"
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

  select = output<string>();
  edit = output<string>();
  delete = output<string>();
  setDefaultShipping = output<string>();
  setDefaultBilling = output<string>();

  onCardClick(): void {
    if (!this.selectable()) return;
    const a = this.address();
    if (a) this.select.emit(a.id);
  }
}
