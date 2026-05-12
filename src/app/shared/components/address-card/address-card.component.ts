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
      class="flex flex-col gap-2 py-4 px-3 rounded-xl transition-colors"
      [class.bg-primary/5]="selected() && selectable()"
      [class.cursor-pointer]="selectable()"
      (click)="onCardClick()"
    >
      <!-- Card header: radio + label -->
      <div class="flex items-start gap-2">
        @if (selectable()) {
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
            [class.border-border]="!selected()"
            [class.border-primary]="selected()"
          >
            @if (selected()) {
              <span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
            }
          </span>
        }
        <h4 class="text-sm font-semibold text-text-primary">
          {{ address()?.label }}
        </h4>
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
