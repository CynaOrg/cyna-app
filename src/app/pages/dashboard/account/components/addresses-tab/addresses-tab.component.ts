import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { AddressCardComponent } from '@shared/components/address-card/address-card.component';
import { UserAddressStore } from '@core/stores/user-address.store';
import {
  UserAddress,
  UpsertUserAddressPayload,
} from '@core/interfaces/user-address.interface';
import { AddressEditModalComponent } from './address-edit-modal.component';

@Component({
  selector: 'app-addresses-tab',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, AddressCardComponent],
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          {{ 'ADDRESSES.TITLE' | translate }}
        </h2>
        <ion-button size="small" (click)="openAdd()">
          {{ 'ADDRESSES.ADD' | translate }}
        </ion-button>
      </div>

      @if (store.isLoading$ | async) {
        <p class="text-sm text-gray-500">{{ 'COMMON.LOADING' | translate }}</p>
      }

      @if (store.error$ | async; as err) {
        <p class="text-sm text-red-700">{{ err }}</p>
      }

      @if (store.data$ | async; as list) {
        @if (list.length === 0 && (store.isLoading$ | async) === false) {
          <div
            class="flex flex-col items-center gap-3 py-10 text-center text-gray-500"
          >
            <p>{{ 'ADDRESSES.EMPTY_STATE' | translate }}</p>
            <ion-button (click)="openAdd()">{{
              'ADDRESSES.ADD_FIRST' | translate
            }}</ion-button>
          </div>
        }

        <div class="grid gap-3 md:grid-cols-2">
          @for (a of list; track a.id) {
            <app-address-card
              [address]="a"
              [showActions]="true"
              (edit)="openEditById($event, list)"
              (deleteAddress)="confirmDeleteById($event, list)"
              (setDefaultShipping)="setDefaultShippingById($event, list)"
              (setDefaultBilling)="setDefaultBillingById($event, list)"
            />
          }
        </div>
      }
    </div>
  `,
})
export class AddressesTabComponent implements OnInit {
  readonly store = inject(UserAddressStore);
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);
  private readonly t = inject(TranslateService);

  ngOnInit(): void {
    this.store.load();
  }

  async openAdd(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddressEditModalComponent,
    });
    await modal.present();
    const { data, role } =
      await modal.onWillDismiss<UpsertUserAddressPayload>();
    if (role === 'save' && data) {
      this.store.create(data).subscribe();
    }
  }

  async openEdit(addr: UserAddress): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddressEditModalComponent,
      componentProps: { existing: addr },
    });
    await modal.present();
    const { data, role } =
      await modal.onWillDismiss<UpsertUserAddressPayload>();
    if (role === 'save' && data) {
      this.store.update(addr.id, data).subscribe();
    }
  }

  openEditById(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (addr) this.openEdit(addr);
  }

  async confirmDelete(addr: UserAddress): Promise<void> {
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

  confirmDeleteById(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (addr) this.confirmDelete(addr);
  }

  setDefaultShipping(addr: UserAddress): void {
    if (addr.isDefaultShipping) return;
    this.store.update(addr.id, { isDefaultShipping: true }).subscribe();
  }

  setDefaultShippingById(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (addr) this.setDefaultShipping(addr);
  }

  setDefaultBilling(addr: UserAddress): void {
    if (addr.isDefaultBilling) return;
    this.store.update(addr.id, { isDefaultBilling: true }).subscribe();
  }

  setDefaultBillingById(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (addr) this.setDefaultBilling(addr);
  }
}
