import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { NgIconComponent } from '@ng-icons/core';
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
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NgIconComponent,
    AddressCardComponent,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <section class="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <!-- Header row -->
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <ng-icon name="phosphorMapPin" class="text-2xl text-primary" />
            <div>
              <h3 class="text-lg font-semibold text-text-primary">
                {{ 'ADDRESSES.SECTION_TITLE' | translate }}
              </h3>
              <p class="text-sm text-text-secondary">
                {{ 'ADDRESSES.SECTION_DESCRIPTION' | translate }}
              </p>
            </div>
          </div>
          <!-- Desktop add button -->
          <button
            type="button"
            class="hidden sm:inline-flex min-h-[46px] items-center justify-center gap-2 !rounded-full border border-black/10 bg-surface !px-6 !py-3 text-[15px] font-semibold !leading-normal text-black transition-colors hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            (click)="openAdd()"
          >
            <ng-icon name="phosphorMapPin" class="text-base" />
            {{ 'ADDRESSES.ADD' | translate }}
          </button>
        </div>

        <!-- Loading -->
        @if (store.isLoading$ | async) {
          <div class="mt-5 border-t border-border-light pt-5">
            <p class="text-sm text-text-secondary">
              {{ 'COMMON.LOADING' | translate }}
            </p>
          </div>
        }

        <!-- Error banner -->
        @if (store.error$ | async; as err) {
          <div
            class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <p class="text-sm text-red-600">{{ err }}</p>
          </div>
        }

        @if (store.data$ | async; as list) {
          @if (list.length === 0 && (store.isLoading$ | async) === false) {
            <!-- Empty state -->
            <div
              class="mt-5 border-t border-border-light pt-5 flex flex-col items-center gap-4 py-10 text-center"
            >
              <ng-icon
                name="phosphorMapPin"
                class="text-4xl text-text-secondary"
              />
              <p class="text-sm text-text-secondary">
                {{ 'ADDRESSES.EMPTY_STATE' | translate }}
              </p>
              <button
                type="button"
                class="inline-flex min-h-[46px] items-center justify-center gap-2 !rounded-full bg-primary !px-6 !py-3 text-[15px] font-semibold !leading-normal text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                (click)="openAdd()"
              >
                {{ 'ADDRESSES.ADD_FIRST' | translate }}
              </button>
            </div>
          } @else if (list.length > 0) {
            <!-- Address list -->
            <div
              class="mt-5 border-t border-border-light pt-5 space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0"
            >
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
        }

        <!-- Mobile add button (shown below list) -->
        <div class="mt-5 sm:hidden">
          <button
            type="button"
            class="inline-flex w-full min-h-[46px] items-center justify-center gap-2 !rounded-full bg-primary !px-6 !py-3 text-[15px] font-semibold !leading-normal text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            (click)="openAdd()"
          >
            {{ 'ADDRESSES.ADD' | translate }}
          </button>
        </div>
      </section>
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
