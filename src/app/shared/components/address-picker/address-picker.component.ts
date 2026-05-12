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
import { RadioOptionComponent } from '../ui-controls/radio-option.component';
import { CheckboxToggleComponent } from '../ui-controls/checkbox-toggle.component';

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
    RadioOptionComponent,
    CheckboxToggleComponent,
  ],
  template: `
    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-text-primary">
        {{
          (type() === 'shipping'
            ? 'CHECKOUT.SHIPPING_ADDRESS'
            : 'CHECKOUT.BILLING_ADDRESS'
          ) | translate
        }}
      </h3>
      @if (isAuthenticated() && (addresses()?.length ?? 0) > 0) {
        <div class="flex flex-col gap-2" data-test="address-list">
          @for (a of addresses(); track a.id) {
            <app-address-card
              [address]="a"
              [selectable]="true"
              [selected]="selectedId() === a.id"
              (cardSelect)="onSelect($event)"
            />
          }

          <div
            data-test="add-new"
            class="rounded-lg border border-dashed border-gray-300 p-3 hover:bg-gray-50"
          >
            <app-radio-option
              [name]="'addr-' + type()"
              [checked]="selectedId() === '__new__'"
              [label]="'ADDRESSES.USE_NEW' | translate"
              (selected)="onSelect('__new__')"
            />
          </div>
        </div>
      }

      @if (showForm()) {
        <app-address-form
          #form
          [type]="type() === 'shipping' ? 'shipping' : 'billing'"
          (addressChange)="onFormChange($event)"
          (validityChange)="onFormValidityChange($event)"
        />

        @if (isAuthenticated()) {
          <div data-test="save-checkbox">
            <app-checkbox-toggle
              [checked]="saveToBook()"
              [label]="'ADDRESSES.SAVE_TO_BOOK' | translate"
              (checkedChange)="onToggleSave($event)"
            />
          </div>
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
  validityChange = output<boolean>();

  @ViewChild('form') form?: AddressFormComponent;

  readonly isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });
  readonly addresses = toSignal(this.addressStore.data$, {
    initialValue: [] as UserAddress[] | null,
  });
  private readonly currentUser = toSignal(this.authStore.user$, {
    initialValue: null,
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
          this.validityChange.emit(false);
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
        this.validityChange.emit(true);
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
    if (id === NEW_ID) {
      // Switching to a fresh form — defer to the form's own validity output.
      this.validityChange.emit(this.form?.form?.valid ?? false);
      return;
    }
    const hit = (this.addresses() ?? []).find((a) => a.id === id);
    if (hit) {
      this.addressChange.emit(toAddressSnapshot(hit));
      this.validityChange.emit(true);
    }
  }

  onFormChange(a: Address): void {
    this.addressChange.emit(a);
  }

  onFormValidityChange(valid: boolean): void {
    if (this.showForm()) this.validityChange.emit(valid);
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
    // Backend requires a non-empty recipientName; the billing form does
    // not collect one, so fall back to the authenticated user's full name
    // (or company name) so the silent save-to-book actually persists.
    const user = this.currentUser();
    const fallbackName =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
      user?.companyName?.trim() ||
      user?.email?.trim() ||
      'Mon adresse';
    const recipientName =
      (snap.recipientName as string | undefined)?.trim() || fallbackName;
    return {
      label,
      recipientName,
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
