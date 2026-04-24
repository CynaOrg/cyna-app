import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/stores/auth.store';
import { UserAddressStore } from '@core/stores/user-address.store';
import { Address } from '@core/interfaces';
import {
  UpsertUserAddressPayload,
  UserAddress,
} from '@core/interfaces/user-address.interface';
import { toAddressSnapshot } from '@core/utils/address.utils';
import { AddressCardComponent } from '../address-card/address-card.component';
import { AddressFormComponent } from '../address-form/address-form.component';

const NEW_ID = '__new__';

@Component({
  selector: 'app-address-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AddressCardComponent,
    AddressFormComponent,
  ],
  template: `
    <div class="flex flex-col gap-3">
      @if (isAuthenticated() && (addresses()?.length ?? 0) > 0) {
        <div class="flex flex-col gap-2" data-test="address-list">
          @for (a of addresses(); track a.id) {
            <app-address-card
              [address]="a"
              [selectable]="true"
              [selected]="selectedId() === a.id"
              (select)="onSelect($event)"
            />
          }

          <label
            data-test="add-new"
            class="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 hover:bg-gray-50"
          >
            <input
              type="radio"
              [name]="'addr-' + type()"
              [checked]="selectedId() === '__new__'"
              (change)="onSelect('__new__')"
              class="accent-black"
            />
            <span class="text-sm font-medium">{{
              'ADDRESSES.USE_NEW' | translate
            }}</span>
          </label>
        </div>
      }

      @if (showForm()) {
        <app-address-form
          #form
          [type]="type() === 'shipping' ? 'shipping' : 'billing'"
          (addressChange)="onFormChange($event)"
        />

        @if (isAuthenticated()) {
          <label
            class="flex items-center gap-2 text-sm"
            data-test="save-checkbox"
          >
            <input
              type="checkbox"
              [checked]="saveToBook()"
              (change)="onToggleSave($any($event.target).checked)"
              class="accent-black"
            />
            <span>{{ 'ADDRESSES.SAVE_TO_BOOK' | translate }}</span>
          </label>
        }
      }
    </div>
  `,
})
export class AddressPickerComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly addressStore = inject(UserAddressStore);
  private readonly destroyRef = inject(DestroyRef);

  type = input<'shipping' | 'billing'>('billing');

  addressChange = output<Address>();
  saveToBookChange = output<boolean>();

  @ViewChild('form') form?: AddressFormComponent;

  readonly isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });
  readonly addresses = toSignal(this.addressStore.data$, {
    initialValue: [] as UserAddress[] | null,
  });

  readonly selectedId = signal<string | null>(null);
  readonly saveToBook = signal<boolean>(true);

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.addressStore.load();
    }

    this.addressStore.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        if (!list || list.length === 0) {
          this.selectedId.set(NEW_ID);
          return;
        }
        if (this.selectedId() !== null) return; // user already picked
        const wantShipping = this.type() === 'shipping';
        const fav = list.find((a) =>
          wantShipping ? a.isDefaultShipping : a.isDefaultBilling,
        );
        const chosen = fav ?? list[0];
        this.selectedId.set(chosen.id);
        this.addressChange.emit(toAddressSnapshot(chosen));
      });
  }

  showForm(): boolean {
    if (!this.isAuthenticated()) return true;
    const list = this.addresses() ?? [];
    if (list.length === 0) return true;
    return this.selectedId() === NEW_ID;
  }

  onSelect(id: string): void {
    this.selectedId.set(id);
    if (id === NEW_ID) return;
    const hit = (this.addresses() ?? []).find((a) => a.id === id);
    if (hit) this.addressChange.emit(toAddressSnapshot(hit));
  }

  onFormChange(a: Address): void {
    this.addressChange.emit(a);
  }

  onToggleSave(v: boolean): void {
    this.saveToBook.set(v);
    this.saveToBookChange.emit(v);
  }

  /**
   * Used by checkout.page to validate and to persist the new address into the
   * book after payment succeeds.
   */
  isValid(): boolean {
    if (this.showForm()) {
      return this.form?.isValid() ?? false;
    }
    return this.selectedId() !== null && this.selectedId() !== NEW_ID;
  }

  isNewAddress(): boolean {
    return (
      this.selectedId() === NEW_ID || (this.addresses() ?? []).length === 0
    );
  }

  shouldSaveToBook(): boolean {
    return this.isAuthenticated() && this.isNewAddress() && this.saveToBook();
  }

  buildUpsertPayload(
    label = 'Auto-saved from checkout',
  ): UpsertUserAddressPayload | null {
    const snap = this.form?.form?.value;
    if (!snap) return null;
    return {
      label,
      recipientName: snap.recipientName ?? '',
      street: snap.street,
      city: snap.city,
      postalCode: snap.postalCode,
      country: snap.country,
      state: snap.state || undefined,
      phone: snap.phone || undefined,
      isDefaultShipping: false,
      isDefaultBilling: false,
    };
  }
}
