import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { AddressCardComponent } from '@shared/components/address-card/address-card.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { UserAddressStore } from '@core/stores/user-address.store';
import { UserAddress } from '@core/interfaces/user-address.interface';

@Component({
  selector: 'app-addresses-tab',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    AddressCardComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <section
      class="rounded-2xl border border-border-light bg-surface p-6 sm:p-7"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-text-primary">
          {{ 'ACCOUNT.SECTIONS.ADDRESSES' | translate }}
        </h3>
        @if ((store.data$ | async)?.length) {
          <button
            type="button"
            (click)="goToNew()"
            class="text-sm font-medium text-primary hover:underline bg-transparent p-0"
          >
            + {{ 'ADDRESSES.ADD' | translate }}
          </button>
        }
      </div>

      @if (store.error$ | async; as err) {
        <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p class="text-sm text-red-600">{{ err }}</p>
        </div>
      }

      @if (store.data$ | async; as list) {
        @if (list.length === 0 && (store.isLoading$ | async) === false) {
          <div class="flex flex-col items-center gap-4 py-12 text-center">
            <p class="text-sm text-text-muted">
              {{ 'ADDRESSES.EMPTY_STATE' | translate }}
            </p>
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              (click)="goToNew()"
            >
              + {{ 'ADDRESSES.ADD_FIRST' | translate }}
            </button>
          </div>
        } @else if (list.length > 0) {
          <div
            class="divide-y divide-border-light lg:grid lg:grid-cols-2 lg:gap-x-6 lg:divide-y-0"
          >
            @for (a of list; track a.id) {
              <app-address-card
                [address]="a"
                [showActions]="true"
                (edit)="goToEdit($event)"
                (deleteAddress)="confirmDeleteById($event, list)"
                (setDefaultShipping)="setDefaultShippingById($event, list)"
                (setDefaultBilling)="setDefaultBillingById($event, list)"
              />
            }
          </div>
        }
      }
    </section>

    @if (pendingDeleteId(); as pendingId) {
      <app-confirm-dialog
        title="ADDRESSES.DELETE"
        message="ADDRESSES.DELETE_CONFIRM"
        confirmLabel="COMMON.DELETE"
        cancelLabel="COMMON.CANCEL"
        [destructive]="true"
        (confirmed)="onDeleteConfirmed(pendingId)"
        (cancelled)="onDeleteCancelled()"
      />
    }
  `,
})
export class AddressesTabComponent implements OnInit {
  readonly store = inject(UserAddressStore);
  private readonly router = inject(Router);

  readonly pendingDeleteId = signal<string | null>(null);

  ngOnInit(): void {
    this.store.load();
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/account/addresses/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/dashboard/account/addresses/edit', id]);
  }

  confirmDeleteById(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (!addr) return;
    this.pendingDeleteId.set(addr.id);
  }

  onDeleteConfirmed(id: string): void {
    this.pendingDeleteId.set(null);
    this.store.remove(id).subscribe();
  }

  onDeleteCancelled(): void {
    this.pendingDeleteId.set(null);
  }

  setDefaultShippingById(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (!addr || addr.isDefaultShipping) return;
    this.store.update(addr.id, { isDefaultShipping: true }).subscribe();
  }

  setDefaultBillingById(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (!addr || addr.isDefaultBilling) return;
    this.store.update(addr.id, { isDefaultBilling: true }).subscribe();
  }
}
