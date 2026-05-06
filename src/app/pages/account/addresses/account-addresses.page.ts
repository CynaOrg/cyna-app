import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonicModule, AlertController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorMapPin,
  phosphorPlus,
  phosphorWarning,
} from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { MobileStateComponent } from '@shared/components/mobile-state/mobile-state.component';
import { AddressCardComponent } from '@shared/components/address-card/address-card.component';
import { UserAddressStore } from '@core/stores/user-address.store';
import { UserAddress } from '@core/interfaces/user-address.interface';

/**
 * Native-only addresses page reachable from the bottom-tab Account screen.
 * Reuses the same UserAddressStore as the web dashboard tab so any change
 * stays in sync across both surfaces.
 */
@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    MobilePageShellComponent,
    MobileStateComponent,
    AddressCardComponent,
  ],
  viewProviders: [
    provideIcons({ phosphorMapPin, phosphorPlus, phosphorWarning }),
  ],
  template: `
    <app-mobile-page-shell
      [showBack]="true"
      title="ACCOUNT.MENU.ADDRESSES"
      actionIcon="phosphorPlus"
      actionLabel="ADDRESSES.ADD"
      [showCart]="true"
      (actionClick)="goToNew()"
    >
      @if ((store.isLoading$ | async) && !(store.data$ | async)?.length) {
        <app-mobile-state variant="loading" title="COMMON.LOADING" />
      } @else if (store.error$ | async; as err) {
        <app-mobile-state
          variant="error"
          icon="phosphorWarning"
          title="ADDRESSES.NOT_FOUND"
          [description]="null"
          ctaLabel="COMMON.RETRY"
          (ctaClick)="reload()"
        />
      } @else if (store.data$ | async; as list) {
        @if (list.length === 0) {
          <app-mobile-state
            variant="empty"
            icon="phosphorMapPin"
            title="ADDRESSES.EMPTY_TITLE"
            description="ADDRESSES.EMPTY_STATE"
            ctaLabel="ADDRESSES.ADD_FIRST"
            (ctaClick)="goToNew()"
          />
        } @else {
          <div class="mx-4 my-2 divide-y divide-black/5 rounded-xl bg-surface">
            @for (a of list; track a.id) {
              <div class="px-4">
                <app-address-card
                  [address]="a"
                  [showActions]="true"
                  (edit)="goToEdit($event)"
                  (deleteAddress)="confirmDelete($event, list)"
                  (setDefaultShipping)="setDefaultShipping($event, list)"
                  (setDefaultBilling)="setDefaultBilling($event, list)"
                />
              </div>
            }
          </div>
        }
      }
    </app-mobile-page-shell>
  `,
})
export class AccountAddressesPage implements OnInit {
  readonly store = inject(UserAddressStore);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);
  private readonly t = inject(TranslateService);

  ngOnInit(): void {
    this.store.load();
  }

  reload(): void {
    this.store.load();
  }

  goToNew(): void {
    this.router.navigate(['/account/addresses/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/account/addresses/edit', id]);
  }

  async confirmDelete(id: string, list: UserAddress[]): Promise<void> {
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

  setDefaultShipping(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (!addr || addr.isDefaultShipping) return;
    this.store.update(addr.id, { isDefaultShipping: true }).subscribe();
  }

  setDefaultBilling(id: string, list: UserAddress[]): void {
    const addr = list.find((a) => a.id === id);
    if (!addr || addr.isDefaultBilling) return;
    this.store.update(addr.id, { isDefaultBilling: true }).subscribe();
  }
}
