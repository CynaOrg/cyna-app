import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@core/interfaces/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <a
      [routerLink]="computedRoute()"
      class="flex flex-col rounded-2xl overflow-hidden"
      [style.width]="fullWidth() ? '100%' : '200px'"
      style="background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08)"
    >
      <!-- Image with overlay -->
      <div class="relative w-full" style="height: 120px">
        @if (product().primaryImageUrl) {
          <img
            [src]="product().primaryImageUrl"
            [alt]="product().name"
            class="w-full h-full object-cover"
          />
        } @else {
          <div
            class="w-full h-full flex items-center justify-center"
            style="background-color: #e5e5e5"
          >
            <span style="color: #9ca3af; font-size: 12px">No image</span>
          </div>
        }
        <div
          class="absolute inset-0"
          style="background-color: rgba(0, 0, 0, 0.6)"
        ></div>
        <!-- Category badge on image -->
        @if (product().categoryName) {
          <span
            class="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium"
            style="background-color: rgba(255,255,255,0.9); color: #0a0a0a"
          >
            {{ product().categoryName }}
          </span>
        }
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-2 p-3">
        <!-- Title -->
        <h3
          class="font-semibold leading-tight line-clamp-2"
          style="font-size: 16px; color: #0a0a0a"
        >
          {{ product().name }}
        </h3>

        <!-- Short description -->
        @if (product().shortDescription) {
          <p
            class="leading-tight line-clamp-2"
            style="font-size: 10px; color: #454545"
          >
            {{ product().shortDescription }}
          </p>
        }

        <!-- Price and availability -->
        <div class="flex items-center justify-between mt-1">
          <!-- Price -->
          <div class="flex items-baseline gap-0.5">
            @if (product().priceMonthly) {
              <span class="font-bold" style="font-size: 20px; color: #4f39f6">
                {{ product().priceMonthly }}&euro;
              </span>
              <span style="font-size: 13px; color: #454545">/mois</span>
            } @else if (product().priceUnit) {
              <span class="font-bold" style="font-size: 20px; color: #4f39f6">
                {{ product().priceUnit }}&euro;
              </span>
            } @else {
              <span style="font-size: 13px; color: #454545">Sur devis</span>
            }
          </div>

          <!-- Availability badge -->
          @if (product().isAvailable) {
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              style="background-color: rgba(52,199,89,0.15); color: #34c759"
            >
              Dispo
            </span>
          } @else {
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              style="background-color: rgba(255,56,60,0.15); color: #ff383c"
            >
              Indispo
            </span>
          }
        </div>
      </div>
    </a>
  `,
})
export class ProductCardComponent {
  product = input.required<Product>();
  linkRoute = input<string>();
  fullWidth = input<boolean>(false);

  computedRoute = computed(() => {
    const route = this.linkRoute();
    if (route) {
      return route;
    }
    return '/products/' + this.product().slug;
  });
}
