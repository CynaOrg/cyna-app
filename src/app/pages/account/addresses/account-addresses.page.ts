import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMapPin,
  phosphorPlus,
  phosphorWarning,
} from '@ng-icons/phosphor-icons/regular';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { MobileStateComponent } from '@shared/components/mobile-state/mobile-state.component';
import { MobileListSkeletonComponent } from '@shared/components/mobile-list-skeleton/mobile-list-skeleton.component';
import { AddressCardComponent } from '@shared/components/address-card/address-card.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
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
    NgIconComponent,
    MobilePageShellComponent,
    MobileStateComponent,
    MobileListSkeletonComponent,
    AddressCardComponent,
    ConfirmDialogComponent,
  ],
  viewProviders: [
    provideIcons({ phosphorMapPin, phosphorPlus, phosphorWarning }),
  ],
  template: `
    <app-mobile-page-shell
      [showBack]="true"
      title="ACCOUNT.MENU.ADDRESSES"
      [showSearch]="true"
      [showCart]="true"
    >
      @if ((store.isLoading$ | async) && !(store.data$ | async)?.length) {
        <app-mobile-list-skeleton variant="address" [count]="3" />
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
          <div class="mx-4 my-2 flex flex-col gap-3">
            @for (a of list; track a.id) {
              <div class="rounded-2xl bg-surface px-3">
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
            <button
              type="button"
              (click)="goToNew()"
              class="flex h-12 w-full items-center justify-center gap-2 !rounded-full border border-dashed border-primary/40 bg-primary/5 text-sm font-medium text-primary"
            >
              <ng-icon name="phosphorPlus" size="16" />
              {{ 'ADDRESSES.ADD' | translate }}
            </button>
          </div>
        }
      }
    </app-mobile-page-shell>

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
export class AccountAddressesPage implements OnInit, ViewWillEnter {
  readonly store = inject(UserAddressStore);
  private readonly router = inject(Router);

  readonly pendingDeleteId = signal<string | null>(null);

  @ViewChild(MobilePageShellComponent) shell?: MobilePageShellComponent;

  ngOnInit(): void {
    this.store.load();
  }

  ionViewWillEnter(): void {
    this.shell?.refresh();
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

  confirmDelete(id: string, list: UserAddress[]): void {
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
