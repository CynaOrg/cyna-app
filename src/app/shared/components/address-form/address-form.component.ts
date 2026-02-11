import {
  Component,
  input,
  output,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../input/input.component';
import { Address } from '@core/interfaces';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputComponent],
  template: `
    <div class="flex flex-col gap-4">
      <h3 class="text-base font-semibold text-black">
        {{
          (type() === 'shipping'
            ? 'CHECKOUT.SHIPPING_ADDRESS'
            : 'CHECKOUT.BILLING_ADDRESS'
          ) | translate
        }}
      </h3>

      <form [formGroup]="form" class="flex flex-col gap-3">
        @if (type() === 'shipping') {
          <app-input
            formControlName="recipientName"
            [label]="'CHECKOUT.RECIPIENT_NAME' | translate"
            [placeholder]="'CHECKOUT.RECIPIENT_NAME_PLACEHOLDER' | translate"
          />
        }

        <app-input
          formControlName="street"
          [label]="'CHECKOUT.STREET' | translate"
          [placeholder]="'CHECKOUT.STREET_PLACEHOLDER' | translate"
        />

        <div class="grid grid-cols-2 gap-3">
          <app-input
            formControlName="postalCode"
            [label]="'CHECKOUT.POSTAL_CODE' | translate"
            [placeholder]="'CHECKOUT.POSTAL_CODE_PLACEHOLDER' | translate"
          />
          <app-input
            formControlName="city"
            [label]="'CHECKOUT.CITY' | translate"
            [placeholder]="'CHECKOUT.CITY_PLACEHOLDER' | translate"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <app-input
            formControlName="country"
            [label]="'CHECKOUT.COUNTRY' | translate"
            [placeholder]="'CHECKOUT.COUNTRY_PLACEHOLDER' | translate"
          />
          <app-input
            formControlName="state"
            [label]="'CHECKOUT.STATE' | translate"
            [placeholder]="'CHECKOUT.STATE_PLACEHOLDER' | translate"
          />
        </div>

        @if (type() === 'shipping') {
          <app-input
            formControlName="phone"
            [label]="'CHECKOUT.PHONE' | translate"
            [placeholder]="'CHECKOUT.PHONE_PLACEHOLDER' | translate"
          />
        }
      </form>
    </div>
  `,
})
export class AddressFormComponent implements OnInit {
  type = input<'billing' | 'shipping'>('billing');
  value = input<Address | null>(null);

  addressChange = output<Address>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  form!: FormGroup;

  ngOnInit(): void {
    const initial = this.value();

    this.form = this.fb.group({
      street: [initial?.street ?? '', Validators.required],
      city: [initial?.city ?? '', Validators.required],
      postalCode: [initial?.postalCode ?? '', Validators.required],
      country: [initial?.country ?? 'FR', Validators.required],
      state: [initial?.state ?? ''],
      ...(this.type() === 'shipping'
        ? {
            recipientName: ['', Validators.required],
            phone: [''],
          }
        : {}),
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (this.form.valid) {
          this.addressChange.emit(val as Address);
        }
      });
  }

  isValid(): boolean {
    this.form.markAllAsTouched();
    return this.form.valid;
  }
}
