import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircle,
  phosphorEnvelope,
  phosphorPackage,
  phosphorShieldCheck,
  phosphorWarningCircle,
} from '@ng-icons/phosphor-icons/regular';
import { EMPTY, catchError } from 'rxjs';
import { Order } from '@core/interfaces';
import { OrderApiService } from '@core/services/order-api.service';
import { AuthStore } from '@core/stores/auth.store';
import { NativePageHeaderComponent } from '../../components/native-page-header.component';
import { SkeletonListComponent } from '../../components/skeleton-list.component';
import { HapticOnDirective } from '../../directives/haptic-on.directive';

/**
 * Native order confirmation page mounted at `/m/order/confirmation/:id`.
 *
 * Displayed right after a successful Stripe payment. Reads the order from
 * the navigation state when present (covers guest checkout) and falls back
 * to fetching by id from the API for authenticated users. Distinguishes
 * status copy for SaaS (active immediately) vs physical (in preparation)
 * vs license (sent by email) line items.
 */
@Component({
  selector: 'app-order-confirmation-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    TranslateModule,
    NgIconComponent,
    NativePageHeaderComponent,
    SkeletonListComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({
      phosphorCheckCircle,
      phosphorEnvelope,
      phosphorPackage,
      phosphorShieldCheck,
      phosphorWarningCircle,
    }),
  ],
  templateUrl: './order-confirmation-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationNativePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderApi = inject(OrderApiService);
  private readonly authStore = inject(AuthStore);

  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(true);
  readonly isAuthenticated = toSignal(this.authStore.isAuthenticated$, {
    initialValue: false,
  });

  readonly hasSaas = computed(() =>
    (this.order()?.items ?? []).some(
      (i) => i.productSnapshot?.productType === 'saas',
    ),
  );

  readonly hasPhysical = computed(() =>
    (this.order()?.items ?? []).some(
      (i) => i.productSnapshot?.productType === 'physical',
    ),
  );

  readonly hasLicense = computed(() =>
    (this.order()?.items ?? []).some(
      (i) =>
        i.productSnapshot?.productType === 'license' ||
        i.productSnapshot?.name?.toLowerCase().includes('license'),
    ),
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/m/home');
      return;
    }

    // Prefer the navigation state (works for guest checkout, no API call).
    const navState =
      this.router.getCurrentNavigation()?.extras?.state ?? history.state;

    if (navState?.orderNumber) {
      const items = (navState.items ?? []).map(
        (item: {
          productId: string;
          quantity: number;
          product?: {
            nameFr?: string;
            nameEn?: string;
            productType?: string;
            priceUnit?: number;
            priceMonthly?: number;
            images?: { imageUrl?: string }[];
          };
        }) => ({
          id: item.productId,
          productId: item.productId,
          productSnapshot: {
            name: item.product?.nameFr ?? item.product?.nameEn ?? 'Product',
            nameEn: item.product?.nameEn,
            nameFr: item.product?.nameFr,
            productType: item.product?.productType,
            image: item.product?.images?.[0]?.imageUrl ?? null,
          },
          quantity: item.quantity,
          unitPrice:
            item.product?.priceUnit ?? item.product?.priceMonthly ?? 0,
          totalPrice:
            (item.product?.priceUnit ?? item.product?.priceMonthly ?? 0) *
            item.quantity,
        }),
      );

      this.order.set({
        id,
        orderNumber: navState.orderNumber,
        userId: null,
        guestEmail: null,
        items,
        subtotal: navState.total ?? 0,
        total: navState.total ?? 0,
        status: 'pending',
        billingAddressSnapshot: {},
        createdAt: new Date().toISOString(),
      });
      this.isLoading.set(false);
      return;
    }

    this.orderApi
      .getOrderById(id)
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((order) => {
        this.order.set(order);
        this.isLoading.set(false);
      });
  }
}
