import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { UserAddressStore } from '@core/stores/user-address.store';
import {
  UpsertUserAddressPayload,
  UserAddress,
} from '@core/interfaces/user-address.interface';
import { ButtonComponent } from '@shared/components/button/button.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-address-form-page',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    NgIconComponent,
    RouterLink,
    ButtonComponent,
  ],
  providers: [provideIcons({ phosphorArrowLeft })],
  templateUrl: './address-form.page.html',
})
export class AddressFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(UserAddressStore);

  form!: FormGroup;
  editingId = signal<string | null>(null);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  notFound = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editingId.set(id);

    this.form = this.fb.group({
      label: ['', [Validators.required, Validators.maxLength(50)]],
      recipientName: ['', [Validators.required, Validators.maxLength(255)]],
      street: ['', [Validators.required, Validators.maxLength(255)]],
      streetLine2: ['', [Validators.maxLength(255)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      postalCode: ['', [Validators.required, Validators.maxLength(20)]],
      state: ['', [Validators.maxLength(100)]],
      country: [
        'FR',
        [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)],
      ],
      phone: ['', [Validators.maxLength(30)]],
      isDefaultShipping: [false],
      isDefaultBilling: [false],
    });

    if (id) {
      this.store.load();
      let populated = false;
      this.store.data$.pipe(take(2)).subscribe({
        next: (list) => {
          const existing = list?.find((a) => a.id === id);
          if (existing) {
            this.populate(existing);
            populated = true;
          }
        },
        complete: () => {
          if (!populated) {
            this.notFound.set(true);
          }
        },
      });
    }
  }

  private populate(a: UserAddress): void {
    this.form.patchValue({
      label: a.label,
      recipientName: a.recipientName,
      street: a.street,
      streetLine2: a.streetLine2 ?? '',
      city: a.city,
      postalCode: a.postalCode,
      state: a.state ?? '',
      country: a.country,
      phone: a.phone ?? '',
      isDefaultShipping: a.isDefaultShipping,
      isDefaultBilling: a.isDefaultBilling,
    });
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  cancel(): void {
    this.router.navigate(['/dashboard/account/addresses']);
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
    this.saving.set(true);
    this.errorMessage.set(null);
    const id = this.editingId();
    const obs = id
      ? this.store.update(id, payload)
      : this.store.create(payload);
    obs.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/account/addresses']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.message ?? 'Erreur');
      },
    });
  }
}
