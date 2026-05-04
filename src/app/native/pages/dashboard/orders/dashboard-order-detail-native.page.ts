import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonicModule } from '@ionic/angular';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorReceipt,
  phosphorMapPin,
  phosphorPackage,
  phosphorFileText,
  phosphorTruck,
} from '@ng-icons/phosphor-icons/regular';
import { catchError, EMPTY } from 'rxjs';
import { OrderApiService } from '@core/services/order-api.service';
import { Order } from '@core/interfaces/order.interface';
import { NativePageHeaderComponent } from '../../../components/native-page-header.component';
import { SkeletonListComponent } from '../../../components/skeleton-list.component';
import { HapticOnDirective } from '../../../directives/haptic-on.directive';

/**
 * Native order detail page mounted at `/m/dashboard/orders/:id`.
 *
 * Mirrors the web `OrderDetailPage` (items, addresses, summary, invoice CTA)
 * collapsed into a single-column scrollable layout.
 */
@Component({
  selector: 'app-dashboard-order-detail-native',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    NgIconComponent,
    NativePageHeaderComponent,
    SkeletonListComponent,
    HapticOnDirective,
  ],
  viewProviders: [
    provideIcons({
      phosphorReceipt,
      phosphorMapPin,
      phosphorPackage,
      phosphorFileText,
      phosphorTruck,
    }),
  ],
  templateUrl: './dashboard-order-detail-native.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOrderDetailNativePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderApi = inject(OrderApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false);
      this.notFound.set(true);
      return;
    }
    this.orderApi
      .getOrderById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.isLoading.set(false);
          this.notFound.set(true);
          return EMPTY;
        }),
      )
      .subscribe((order) => {
        this.order.set(order);
        this.isLoading.set(false);
      });
  }

  isPhysical(order: Order): boolean {
    return order.items.some(
      (item) => item.productSnapshot.productType === 'physical',
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid':
      case 'completed':
        return '#34c759';
      case 'pending':
      case 'processing':
        return '#ff9500';
      case 'shipped':
        return '#007aff';
      case 'cancelled':
      case 'refunded':
        return '#ff383c';
      default:
        return '#9ca3af';
    }
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payée',
      processing: 'En cours',
      shipped: 'Expédiée',
      completed: 'Terminée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
    };
    return map[status] || status;
  }
}
