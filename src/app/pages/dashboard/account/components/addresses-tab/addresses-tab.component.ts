import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { AddressCardComponent } from '@shared/components/address-card/address-card.component';
import { UserAddressStore } from '@core/stores/user-address.store';
import { UserAddress } from '@core/interfaces/user-address.interface';

@Component({
  selector: 'app-addresses-tab',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, AddressCardComponent],
  template: `
    <section class="py-6 first:pt-0">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h3
          class="text-xs font-semibold uppercase tracking-wide text-text-muted"
        >
          {{ 'ACCOUNT.SECTIONS.ADDRESSES' | translate }}
        </h3>
        <button
          type="button"
          (click)="goToNew()"
          class="text-sm font-medium text-primary hover:underline bg-transparent p-0"
        >
          + {{ 'ADDRESSES.ADD' | translate }}
        </button>
      </div>

      @if (store.error$ | async; as err) {
        <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p class="text-sm text-red-600">{{ err }}</p>
        </div>
      }

      @if (store.data$ | async; as list) {
        @if (list.length === 0 && (store.isLoading$ | async) === false) {
          <div class="flex flex-col items-center gap-4 py-10 text-center">
            <p class="text-sm text-text-muted">
              {{ 'ADDRESSES.EMPTY_STATE' | translate }}
            </p>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              (click)="goToNew()"
            >
              {{ 'ADDRESSES.ADD_FIRST' | translate }}
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
  `,
})
export class AddressesTabComponent implements OnInit {
  readonly store = inject(UserAddressStore);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);
  private readonly t = inject(TranslateService);

  ngOnInit(): void {
    this.store.load();
  }

  goToNew(): void {
    this.router.navigate(['/dashboard/account/addresses/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/dashboard/account/addresses/edit', id]);
  }

  async confirmDeleteById(id: string, list: UserAddress[]): Promise<void> {
    const addr = list.find((a) => a.id === id);
    if (!addr) return;
    const alert = await this.alertCtrl.create({
      header: this.t.instant('ADDRESSES.DELETE'),
      message: this.t.instant('ADDRESSES.DELETE_CONFIRM'),
      buttons: [
        { text: this.t.instant('COMMON.CANCEL'), role: 'cancel' },
        {
          text: this.t.instant('COMMON.DELETE'),
          role: 'destructive',
          handler: () => this.store.remove(addr.id).subscribe(),
        },
      ],
    });
    await alert.present();
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
