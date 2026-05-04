import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'product-card' | 'list-item' | 'detail';

/**
 * Generic skeleton loader for native-feel mobile loading states.
 *
 * Renders a configurable number of placeholder cards while data is being
 * fetched. Built on top of `ion-skeleton-text` so the shimmer animation
 * matches the rest of the Ionic UI exactly.
 *
 * Variants:
 * - `product-card` (default): silhouette of a `product-card` (square image
 *   + title + price/badge row), suitable for grid/list of products.
 * - `list-item`: simple horizontal row, suitable for orders, addresses...
 * - `detail`: hero image + title + paragraph block, suitable for a detail
 *   page above-the-fold loader.
 *
 * Usage:
 * ```html
 * @if (isLoading()) {
 *   <app-skeleton-list [count]="6" variant="product-card" />
 * } @else {
 *   <!-- real content -->
 * }
 * ```
 */
@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { class: 'block w-full' },
  template: `
    @switch (variant()) {
      @case ('product-card') {
        <div
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          [attr.aria-busy]="true"
          [attr.aria-label]="'Loading items'"
          role="status"
        >
          @for (i of items(); track i) {
            <div
              class="flex flex-col rounded-xl bg-surface border border-border/30 shadow-sm overflow-hidden"
            >
              <div class="relative w-full" style="aspect-ratio: 1 / 1">
                <ion-skeleton-text
                  animated="true"
                  style="width: 100%; height: 100%; margin: 0;"
                ></ion-skeleton-text>
              </div>
              <div class="flex flex-col gap-2 p-3">
                <ion-skeleton-text
                  animated="true"
                  style="width: 80%; height: 14px;"
                ></ion-skeleton-text>
                <ion-skeleton-text
                  animated="true"
                  style="width: 60%; height: 12px;"
                ></ion-skeleton-text>
                <div class="flex items-center justify-between pt-1">
                  <ion-skeleton-text
                    animated="true"
                    style="width: 40%; height: 16px;"
                  ></ion-skeleton-text>
                  <ion-skeleton-text
                    animated="true"
                    style="width: 24px; height: 16px; border-radius: 9999px;"
                  ></ion-skeleton-text>
                </div>
              </div>
            </div>
          }
        </div>
      }
      @case ('list-item') {
        <div
          class="flex flex-col gap-2"
          [attr.aria-busy]="true"
          [attr.aria-label]="'Loading items'"
          role="status"
        >
          @for (i of items(); track i) {
            <div
              class="flex items-center gap-3 rounded-xl bg-surface border border-border/30 p-3"
            >
              <ion-skeleton-text
                animated="true"
                style="width: 48px; height: 48px; border-radius: 9999px; flex-shrink: 0;"
              ></ion-skeleton-text>
              <div class="flex-1 flex flex-col gap-2">
                <ion-skeleton-text
                  animated="true"
                  style="width: 70%; height: 14px;"
                ></ion-skeleton-text>
                <ion-skeleton-text
                  animated="true"
                  style="width: 45%; height: 12px;"
                ></ion-skeleton-text>
              </div>
              <ion-skeleton-text
                animated="true"
                style="width: 56px; height: 14px;"
              ></ion-skeleton-text>
            </div>
          }
        </div>
      }
      @case ('detail') {
        <div
          class="flex flex-col gap-4"
          [attr.aria-busy]="true"
          [attr.aria-label]="'Loading content'"
          role="status"
        >
          <!-- Hero image -->
          <div class="relative w-full" style="aspect-ratio: 16 / 9">
            <ion-skeleton-text
              animated="true"
              style="width: 100%; height: 100%; margin: 0; border-radius: 12px;"
            ></ion-skeleton-text>
          </div>
          <!-- Title block -->
          <div class="flex flex-col gap-2">
            <ion-skeleton-text
              animated="true"
              style="width: 70%; height: 24px;"
            ></ion-skeleton-text>
            <ion-skeleton-text
              animated="true"
              style="width: 40%; height: 16px;"
            ></ion-skeleton-text>
          </div>
          <!-- Paragraphs -->
          @for (i of items(); track i) {
            <div class="flex flex-col gap-2">
              <ion-skeleton-text
                animated="true"
                style="width: 100%; height: 12px;"
              ></ion-skeleton-text>
              <ion-skeleton-text
                animated="true"
                style="width: 95%; height: 12px;"
              ></ion-skeleton-text>
              <ion-skeleton-text
                animated="true"
                style="width: 80%; height: 12px;"
              ></ion-skeleton-text>
            </div>
          }
        </div>
      }
    }
  `,
})
export class SkeletonListComponent {
  /** Number of skeleton items/blocks to render. */
  count = input<number>(3);

  /** Visual variant of the skeleton. */
  variant = input<SkeletonVariant>('product-card');

  /** Materialised array used by the `@for` loop. */
  protected readonly items = computed(() => {
    const n = Math.max(0, this.count());
    return Array.from({ length: n }, (_, i) => i);
  });
}
