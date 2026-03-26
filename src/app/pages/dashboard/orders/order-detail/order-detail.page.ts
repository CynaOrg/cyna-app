import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorReceipt,
  phosphorMapPin,
  phosphorPackage,
  phosphorFileText,
} from '@ng-icons/phosphor-icons/regular';
import { DashboardTopBarComponent } from '@shared/components/dashboard-topbar/dashboard-topbar.component';
import { OrderApiService } from '@core/services/order-api.service';
import { Order } from '@core/interfaces';
import { catchError, EMPTY } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-order-detail',
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterLink,
    NgIconComponent,
    DashboardTopBarComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorArrowLeft,
      phosphorReceipt,
      phosphorMapPin,
      phosphorPackage,
      phosphorFileText,
    }),
  ],
  template: `
    <app-dashboard-topbar
      [title]="'ORDERS.DETAIL.TITLE' | translate"
      [showBack]="true"
    />

    <div class="py-2">
      @if (isLoading()) {
        <div class="flex items-center justify-center min-h-[40vh]">
          <div
            class="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"
          ></div>
        </div>
      } @else if (order(); as o) {
        <!-- Header: Order number + Status -->
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6"
        >
          <div class="flex flex-col gap-1">
            <h1 class="text-xl font-bold text-text-primary sm:text-2xl">
              {{ o.orderNumber }}
            </h1>
            <span class="text-sm text-text-muted">{{
              o.createdAt | date: 'dd MMMM yyyy, HH:mm'
            }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              [style.background-color]="getStatusBg(o.status)"
              [style.color]="getStatusColor(o.status)"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                [style.background-color]="getStatusColor(o.status)"
              ></span>
              {{ getStatusLabel(o.status) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <!-- Left column: Items + Addresses -->
          <div class="flex flex-col gap-5 lg:col-span-2">
            <!-- Items card -->
            <div class="rounded-xl border border-border-light bg-surface p-5">
              <div class="flex items-center gap-2 mb-4">
                <ng-icon
                  name="phosphorPackage"
                  class="text-text-muted"
                  size="18"
                ></ng-icon>
                <h2 class="text-sm font-semibold text-text-primary">
                  {{ 'ORDERS.DETAIL.ITEMS' | translate }}
                </h2>
              </div>
              <div class="flex flex-col divide-y divide-border-light">
                @for (item of o.items; track item.id) {
                  <div class="flex items-center gap-4 py-3">
                    @if (item.productSnapshot?.image) {
                      <img
                        [src]="item.productSnapshot.image"
                        [alt]="item.productSnapshot.name"
                        class="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    } @else {
                      <div
                        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-border-light"
                      >
                        <ng-icon
                          name="phosphorPackage"
                          class="text-text-muted"
                          size="20"
                        ></ng-icon>
                      </div>
                    }
                    <div
                      class="flex flex-1 items-center justify-between gap-2 min-w-0"
                    >
                      <div class="flex flex-col gap-0.5 min-w-0">
                        <span
                          class="text-sm font-medium text-text-primary truncate"
                        >
                          {{ item.productSnapshot?.name || 'Produit' }}
                        </span>
                        <span class="text-xs text-text-muted">
                          {{ item.unitPrice | number: '1.2-2' }}&euro; &times;
                          {{ item.quantity }}
                        </span>
                      </div>
                      <span
                        class="text-sm font-semibold text-text-primary shrink-0"
                      >
                        {{ item.totalPrice | number: '1.2-2' }}&euro;
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Addresses -->
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <!-- Billing address -->
              <div class="rounded-xl border border-border-light bg-surface p-5">
                <div class="flex items-center gap-2 mb-3">
                  <ng-icon
                    name="phosphorReceipt"
                    class="text-text-muted"
                    size="18"
                  ></ng-icon>
                  <h2 class="text-sm font-semibold text-text-primary">
                    {{ 'ORDERS.DETAIL.BILLING_ADDRESS' | translate }}
                  </h2>
                </div>
                @if (o.billingAddressSnapshot) {
                  <div
                    class="flex flex-col gap-0.5 text-sm text-text-secondary"
                  >
                    @if (
                      o.billingAddressSnapshot['firstName'] ||
                      o.billingAddressSnapshot['lastName']
                    ) {
                      <span class="font-medium text-text-primary"
                        >{{ o.billingAddressSnapshot['firstName'] }}
                        {{ o.billingAddressSnapshot['lastName'] }}</span
                      >
                    }
                    <span>{{ o.billingAddressSnapshot.street }}</span>
                    <span
                      >{{ o.billingAddressSnapshot.postalCode }}
                      {{ o.billingAddressSnapshot.city }}</span
                    >
                    <span>{{ o.billingAddressSnapshot.country }}</span>
                  </div>
                } @else {
                  <span class="text-sm text-text-muted">-</span>
                }
              </div>

              <!-- Shipping address -->
              @if (o.shippingAddressSnapshot) {
                <div
                  class="rounded-xl border border-border-light bg-surface p-5"
                >
                  <div class="flex items-center gap-2 mb-3">
                    <ng-icon
                      name="phosphorMapPin"
                      class="text-text-muted"
                      size="18"
                    ></ng-icon>
                    <h2 class="text-sm font-semibold text-text-primary">
                      {{ 'ORDERS.DETAIL.SHIPPING_ADDRESS' | translate }}
                    </h2>
                  </div>
                  <div
                    class="flex flex-col gap-0.5 text-sm text-text-secondary"
                  >
                    @if (
                      o.shippingAddressSnapshot['firstName'] ||
                      o.shippingAddressSnapshot['lastName']
                    ) {
                      <span class="font-medium text-text-primary"
                        >{{ o.shippingAddressSnapshot['firstName'] }}
                        {{ o.shippingAddressSnapshot['lastName'] }}</span
                      >
                    }
                    <span>{{ o.shippingAddressSnapshot.street }}</span>
                    <span
                      >{{ o.shippingAddressSnapshot.postalCode }}
                      {{ o.shippingAddressSnapshot.city }}</span
                    >
                    <span>{{ o.shippingAddressSnapshot.country }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right column: Payment summary -->
          <div class="flex flex-col gap-5">
            <!-- Ticket / Receipt card -->
            <div class="rounded-xl border border-border-light bg-surface p-5">
              <div class="flex items-center gap-2 mb-4">
                <ng-icon
                  name="phosphorFileText"
                  class="text-text-muted"
                  size="18"
                ></ng-icon>
                <h2 class="text-sm font-semibold text-text-primary">
                  {{ 'ORDERS.DETAIL.SUMMARY' | translate }}
                </h2>
              </div>

              <div class="flex flex-col gap-3">
                <!-- Order info -->
                <div class="flex flex-col gap-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{
                      'ORDERS.DETAIL.ORDER_NUMBER' | translate
                    }}</span>
                    <span class="font-medium text-text-primary">{{
                      o.orderNumber
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{
                      'ORDERS.DETAIL.DATE' | translate
                    }}</span>
                    <span class="font-medium text-text-primary">{{
                      o.createdAt | date: 'dd/MM/yyyy'
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{
                      'ORDERS.DETAIL.STATUS' | translate
                    }}</span>
                    <span
                      class="font-medium"
                      [style.color]="getStatusColor(o.status)"
                      >{{ getStatusLabel(o.status) }}</span
                    >
                  </div>
                  @if (o.paidAt) {
                    <div class="flex justify-between">
                      <span class="text-text-muted">{{
                        'ORDERS.DETAIL.PAID_AT' | translate
                      }}</span>
                      <span class="font-medium text-text-primary">{{
                        o.paidAt | date: 'dd/MM/yyyy'
                      }}</span>
                    </div>
                  }
                </div>

                <!-- Separator -->
                <div class="border-t border-border-light"></div>

                <!-- Price breakdown -->
                <div class="flex flex-col gap-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{
                      'ORDERS.DETAIL.SUBTOTAL' | translate
                    }}</span>
                    <span class="font-medium text-text-primary"
                      >{{ o.subtotal | number: '1.2-2' }}&euro;</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{
                      'ORDERS.DETAIL.VAT' | translate
                    }}</span>
                    <span class="font-medium text-text-primary"
                      >{{ o.total - o.subtotal | number: '1.2-2' }}&euro;</span
                    >
                  </div>
                </div>

                <!-- Total -->
                <div class="border-t border-border-light pt-2">
                  <div class="flex justify-between">
                    <span class="text-base font-semibold text-text-primary">{{
                      'ORDERS.DETAIL.TOTAL' | translate
                    }}</span>
                    <span class="text-lg font-bold text-primary"
                      >{{ o.total | number: '1.2-2' }}&euro;</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <button
              class="w-full flex items-center justify-center gap-2 h-12 !rounded-full bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-hover"
            >
              <ng-icon
                name="phosphorFileText"
                size="18"
                style="color: #ffffff"
              ></ng-icon>
              {{ 'ORDERS.DETAIL.DOWNLOAD_INVOICE' | translate }}
            </button>
          </div>
        </div>
      } @else {
        <!-- Order not found -->
        <div class="flex flex-col items-center justify-center gap-4 py-20">
          <span class="text-base font-medium text-text-secondary">{{
            'ORDERS.DETAIL.NOT_FOUND' | translate
          }}</span>
          <a
            routerLink="/dashboard/orders"
            class="text-sm font-medium text-primary"
            style="text-decoration: none"
          >
            &larr; {{ 'ORDERS.DETAIL.BACK' | translate }}
          </a>
        </div>
      }
    </div>
  `,
})
export class OrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderApi = inject(OrderApiService);

  order = signal<Order | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
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

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#ff9500',
      paid: '#34c759',
      processing: '#007aff',
      shipped: '#5856d6',
      completed: '#34c759',
      cancelled: '#ff383c',
      refunded: '#9ca3af',
    };
    return map[status] || '#9ca3af';
  }

  getStatusBg(status: string): string {
    const color = this.getStatusColor(status);
    return color + '15';
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
