import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentMethodStore } from '@core/stores/payment-method.store';
import { InvoiceStore } from '@core/stores/invoice.store';
import { UserAddressStore } from '@core/stores/user-address.store';
import { PaymentMethod } from '@core/interfaces/payment-method.interface';

@Component({
  selector: 'app-billing-tab',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
  templateUrl: './billing-tab.component.html',
})
export class BillingTabComponent implements OnInit {
  readonly paymentStore = inject(PaymentMethodStore);
  readonly invoiceStore = inject(InvoiceStore);
  readonly addressStore = inject(UserAddressStore);
  private readonly toast = inject(ToastController);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.paymentStore.load();
    this.invoiceStore.load(5);
    this.addressStore.load();
  }

  async onAddCard(): Promise<void> {
    const msg = this.translate.instant('SECURITY.DATA_EXPORT.NOT_AVAILABLE');
    const t = await this.toast.create({ message: msg, duration: 3000 });
    await t.present();
  }

  onDeleteCard(m: PaymentMethod): void {
    this.paymentStore.remove(m.id).subscribe();
  }

  goToAddresses(): void {
    this.router.navigate(['/dashboard/account', 'addresses']);
  }

  brandIcon(brand: PaymentMethod['brand']): string {
    const map: Record<PaymentMethod['brand'], string> = {
      visa: '/assets/payment-brands/visa.svg',
      mastercard: '/assets/payment-brands/mastercard.svg',
      amex: '/assets/payment-brands/amex.svg',
      other: '/assets/payment-brands/card.svg',
    };
    return map[brand] ?? map['other'];
  }
}
