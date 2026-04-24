import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';
import {
  UpsertUserAddressPayload,
  UserAddress,
} from '@core/interfaces/user-address.interface';

@Component({
  selector: 'app-address-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    AddressFormComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{ (existing() ? 'ADDRESSES.EDIT' : 'ADDRESSES.ADD') | translate }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">{{
            'COMMON.CANCEL' | translate
          }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex flex-col gap-6 p-1">
        <!-- Label field -->
        <form [formGroup]="meta" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-text-primary">
              {{ 'ADDRESSES.LABEL' | translate }}
            </label>
            <input
              type="text"
              formControlName="label"
              [placeholder]="'ADDRESSES.LABEL_PLACEHOLDER' | translate"
              class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
            />
          </div>
        </form>

        <!-- Address form -->
        <div>
          <app-address-form #form [type]="'shipping'" />
        </div>

        <!-- Default flags -->
        <ng-container [formGroup]="meta">
          <div
            class="rounded-lg border border-border-light bg-background p-4 space-y-3"
          >
            <label
              class="flex items-center gap-3 text-sm text-text-primary cursor-pointer"
            >
              <input
                type="checkbox"
                formControlName="isDefaultShipping"
                class="h-4 w-4 accent-primary"
              />
              <span>{{ 'ADDRESSES.DEFAULT_SHIPPING' | translate }}</span>
            </label>
            <label
              class="flex items-center gap-3 text-sm text-text-primary cursor-pointer"
            >
              <input
                type="checkbox"
                formControlName="isDefaultBilling"
                class="h-4 w-4 accent-primary"
              />
              <span>{{ 'ADDRESSES.DEFAULT_BILLING' | translate }}</span>
            </label>
          </div>
        </ng-container>

        <!-- Save button -->
        <div class="flex justify-end">
          <button
            type="button"
            (click)="save()"
            class="inline-flex min-h-[46px] items-center justify-center gap-2 !rounded-full bg-primary !px-6 !py-3 text-[15px] font-semibold !leading-normal text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </div>
    </ion-content>
  `,
})
export class AddressEditModalComponent implements OnInit {
  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);

  existing = input<UserAddress | null>(null);

  @ViewChild('form') form?: AddressFormComponent;

  meta!: FormGroup;

  ngOnInit(): void {
    const ex = this.existing();
    this.meta = this.fb.group({
      label: [ex?.label ?? '', [Validators.required, Validators.maxLength(50)]],
      isDefaultShipping: [ex?.isDefaultShipping ?? false],
      isDefaultBilling: [ex?.isDefaultBilling ?? false],
    });
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (this.meta.invalid || !this.form?.isValid()) {
      this.meta.markAllAsTouched();
      return;
    }
    const addrVal = this.form!.form.value;
    const payload: UpsertUserAddressPayload = {
      label: this.meta.value.label,
      recipientName: addrVal.recipientName ?? '',
      street: addrVal.street,
      city: addrVal.city,
      postalCode: addrVal.postalCode,
      country: addrVal.country,
      state: addrVal.state || undefined,
      phone: addrVal.phone || undefined,
      streetLine2: undefined,
      isDefaultShipping: this.meta.value.isDefaultShipping,
      isDefaultBilling: this.meta.value.isDefaultBilling,
    };
    this.modalCtrl.dismiss(payload, 'save');
  }
}
