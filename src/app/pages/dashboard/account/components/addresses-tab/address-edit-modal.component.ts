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
      <form [formGroup]="meta" class="flex flex-col gap-3">
        <input
          formControlName="label"
          [placeholder]="'ADDRESSES.LABEL_PLACEHOLDER' | translate"
          class="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </form>

      <div class="mt-4">
        <app-address-form #form [type]="'shipping'" />
      </div>

      <ng-container [formGroup]="meta">
        <div class="mt-4 flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isDefaultShipping" />
            <span>{{ 'ADDRESSES.DEFAULT_SHIPPING' | translate }}</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isDefaultBilling" />
            <span>{{ 'ADDRESSES.DEFAULT_BILLING' | translate }}</span>
          </label>
        </div>
      </ng-container>

      <div class="mt-6 flex justify-end">
        <ion-button (click)="save()">{{
          'COMMON.SAVE' | translate
        }}</ion-button>
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
