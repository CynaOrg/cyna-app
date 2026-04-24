import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorX } from '@ng-icons/phosphor-icons/regular';
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
    NgIconComponent,
  ],
  providers: [provideIcons({ phosphorX })],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="!bg-surface">
        <div class="flex items-center justify-between px-2">
          <h2 class="text-lg font-semibold text-text-primary">
            {{ (existing() ? 'ADDRESSES.EDIT' : 'ADDRESSES.ADD') | translate }}
          </h2>
          <button
            type="button"
            (click)="cancel()"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            [attr.aria-label]="'COMMON.CANCEL' | translate"
          >
            <ng-icon name="phosphorX" class="text-xl" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form" class="flex flex-col gap-5">
        <!-- Libellé -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary">
            {{ 'ADDRESSES.LABEL' | translate }}
          </label>
          <input
            type="text"
            formControlName="label"
            [placeholder]="'ADDRESSES.LABEL_PLACEHOLDER' | translate"
            class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
            [class.border-red-400]="fieldInvalid('label')"
          />
          @if (fieldInvalid('label')) {
            <p class="text-xs text-red-500">
              {{ 'ADDRESSES.LABEL_REQUIRED' | translate }}
            </p>
          }
        </div>

        <!-- Section: destinataire -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary">
            {{ 'ADDRESSES.RECIPIENT_NAME' | translate }}
          </label>
          <input
            type="text"
            formControlName="recipientName"
            [placeholder]="'ADDRESSES.RECIPIENT_PLACEHOLDER' | translate"
            autocomplete="name"
            class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
            [class.border-red-400]="fieldInvalid('recipientName')"
          />
        </div>

        <!-- Rue -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary">
            {{ 'ADDRESSES.STREET' | translate }}
          </label>
          <input
            type="text"
            formControlName="street"
            [placeholder]="'ADDRESSES.STREET_PLACEHOLDER' | translate"
            autocomplete="street-address"
            class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
            [class.border-red-400]="fieldInvalid('street')"
          />
        </div>

        <!-- Complément -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary">
            {{ 'ADDRESSES.STREET_LINE2' | translate }}
          </label>
          <input
            type="text"
            formControlName="streetLine2"
            [placeholder]="'ADDRESSES.STREET_LINE2_PLACEHOLDER' | translate"
            autocomplete="address-line2"
            class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
          />
        </div>

        <!-- CP + Ville (2 cols on sm+) -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text-primary">
              {{ 'ADDRESSES.POSTAL_CODE' | translate }}
            </label>
            <input
              type="text"
              formControlName="postalCode"
              placeholder="75001"
              autocomplete="postal-code"
              class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
              [class.border-red-400]="fieldInvalid('postalCode')"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text-primary">
              {{ 'ADDRESSES.CITY' | translate }}
            </label>
            <input
              type="text"
              formControlName="city"
              placeholder="Paris"
              autocomplete="address-level2"
              class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
              [class.border-red-400]="fieldInvalid('city')"
            />
          </div>
        </div>

        <!-- Pays + Région -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text-primary">
              {{ 'ADDRESSES.COUNTRY' | translate }}
            </label>
            <input
              type="text"
              formControlName="country"
              placeholder="FR"
              maxlength="2"
              autocomplete="country"
              class="h-12 w-full rounded-lg border border-border px-4 text-sm uppercase text-text-primary outline-none transition-colors focus:border-primary"
              [class.border-red-400]="fieldInvalid('country')"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-text-primary">
              {{ 'ADDRESSES.STATE' | translate }}
            </label>
            <input
              type="text"
              formControlName="state"
              [placeholder]="'ADDRESSES.STATE_PLACEHOLDER' | translate"
              autocomplete="address-level1"
              class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>

        <!-- Téléphone -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary">
            {{ 'ADDRESSES.PHONE' | translate }}
          </label>
          <input
            type="tel"
            formControlName="phone"
            [placeholder]="'ADDRESSES.PHONE_PLACEHOLDER' | translate"
            autocomplete="tel"
            class="h-12 w-full rounded-lg border border-border px-4 text-sm text-text-primary outline-none transition-colors focus:border-primary"
          />
        </div>

        <!-- Defaults block -->
        <div class="rounded-lg border border-border-light bg-background p-4">
          <p class="mb-3 text-sm font-medium text-text-primary">
            {{ 'ADDRESSES.DEFAULTS_TITLE' | translate }}
          </p>
          <div class="flex flex-col gap-3">
            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                formControlName="isDefaultShipping"
                class="h-4 w-4 accent-primary"
              />
              <span class="text-sm text-text-primary">{{
                'ADDRESSES.DEFAULT_SHIPPING' | translate
              }}</span>
            </label>
            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                formControlName="isDefaultBilling"
                class="h-4 w-4 accent-primary"
              />
              <span class="text-sm text-text-primary">{{
                'ADDRESSES.DEFAULT_BILLING' | translate
              }}</span>
            </label>
          </div>
        </div>
      </form>
    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-toolbar class="!bg-surface">
        <div
          class="flex flex-col-reverse gap-3 px-2 py-2 sm:flex-row sm:justify-end"
        >
          <button
            type="button"
            (click)="cancel()"
            class="inline-flex min-h-[46px] items-center justify-center !rounded-full border border-black/10 bg-surface !px-6 !py-3 text-[15px] font-semibold !leading-normal text-black transition-colors hover:bg-background"
          >
            {{ 'COMMON.CANCEL' | translate }}
          </button>
          <button
            type="button"
            (click)="save()"
            [disabled]="form.invalid"
            class="inline-flex min-h-[46px] items-center justify-center gap-2 !rounded-full bg-primary !px-6 !py-3 text-[15px] font-semibold !leading-normal text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class AddressEditModalComponent implements OnInit {
  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);

  existing = input<UserAddress | null>(null);

  form!: FormGroup;

  ngOnInit(): void {
    const ex = this.existing();
    this.form = this.fb.group({
      label: [ex?.label ?? '', [Validators.required, Validators.maxLength(50)]],
      recipientName: [
        ex?.recipientName ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      street: [
        ex?.street ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      streetLine2: [ex?.streetLine2 ?? '', [Validators.maxLength(255)]],
      city: [ex?.city ?? '', [Validators.required, Validators.maxLength(100)]],
      postalCode: [
        ex?.postalCode ?? '',
        [Validators.required, Validators.maxLength(20)],
      ],
      state: [ex?.state ?? '', [Validators.maxLength(100)]],
      country: [
        ex?.country ?? 'FR',
        [Validators.required, Validators.pattern(/^[A-Z]{2}$/)],
      ],
      phone: [ex?.phone ?? '', [Validators.maxLength(30)]],
      isDefaultShipping: [ex?.isDefaultShipping ?? false],
      isDefaultBilling: [ex?.isDefaultBilling ?? false],
    });
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload: UpsertUserAddressPayload = {
      label: v.label,
      recipientName: v.recipientName,
      street: v.street,
      streetLine2: v.streetLine2 || undefined,
      city: v.city,
      postalCode: v.postalCode,
      state: v.state || undefined,
      country: v.country.toUpperCase(),
      phone: v.phone || undefined,
      isDefaultShipping: !!v.isDefaultShipping,
      isDefaultBilling: !!v.isDefaultBilling,
    };
    this.modalCtrl.dismiss(payload, 'save');
  }
}
