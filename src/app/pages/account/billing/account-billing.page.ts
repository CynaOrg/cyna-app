import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { BillingTabComponent } from '../../dashboard/account/components/billing-tab/billing-tab.component';

/**
 * Native-only Billing sub-page reachable from the bottom-tab Account screen.
 * Reuses the standalone BillingTabComponent so payment-methods, invoices and
 * default-address management stay in sync with the web dashboard.
 */
@Component({
  selector: 'app-account-billing',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MobilePageShellComponent,
    BillingTabComponent,
  ],
  template: `
    <app-mobile-page-shell
      [showBack]="true"
      title="ACCOUNT.MENU.BILLING"
      [showSearch]="true"
      [showCart]="true"
    >
      <div class="px-4 py-4">
        <app-billing-tab />
      </div>
    </app-mobile-page-shell>
  `,
})
export class AccountBillingPage {}
