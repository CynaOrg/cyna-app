import { Component, computed, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export type SkeletonVariant = 'product-card' | 'list-item' | 'detail';

/**
 * Native loading skeletons used while pages fetch data.
 *
 * Three variants cover the cases we hit on mobile: catalog tiles, vertical
 * list items (orders / addresses), and a detail-view stack. The `count` input
 * controls how many placeholders are rendered for the repeating variants.
 */
@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [IonicModule],
  template: `
    @switch (variant()) {
      @case ('product-card') {
        <div class="grid grid-cols-2 gap-3 p-4">
          @for (_ of placeholders(); track $index) {
            <div
              class="overflow-hidden rounded-2xl border border-black/5 bg-white"
            >
              <ion-skeleton-text
                animated
                style="height: 140px; width: 100%; margin: 0;"
              />
              <div class="space-y-2 p-3">
                <ion-skeleton-text animated style="width: 70%; height: 14px;" />
                <ion-skeleton-text animated style="width: 40%; height: 12px;" />
                <ion-skeleton-text animated style="width: 50%; height: 18px;" />
              </div>
            </div>
          }
        </div>
      }
      @case ('list-item') {
        <ul class="divide-y divide-black/5 px-4">
          @for (_ of placeholders(); track $index) {
            <li class="flex items-center gap-3 py-3">
              <ion-skeleton-text
                animated
                style="width: 48px; height: 48px; border-radius: 12px;"
              />
              <div class="flex-1 space-y-2">
                <ion-skeleton-text animated style="width: 60%; height: 14px;" />
                <ion-skeleton-text animated style="width: 35%; height: 12px;" />
              </div>
            </li>
          }
        </ul>
      }
      @case ('detail') {
        <div class="space-y-3 p-4">
          <ion-skeleton-text
            animated
            style="height: 220px; width: 100%; border-radius: 16px;"
          />
          <ion-skeleton-text animated style="width: 70%; height: 22px;" />
          <ion-skeleton-text animated style="width: 40%; height: 16px;" />
          <ion-skeleton-text animated style="width: 100%; height: 12px;" />
          <ion-skeleton-text animated style="width: 95%; height: 12px;" />
          <ion-skeleton-text animated style="width: 80%; height: 12px;" />
        </div>
      }
    }
  `,
})
export class SkeletonListComponent {
  readonly count = input<number>(3);
  readonly variant = input<SkeletonVariant>('product-card');

  /** Stable array reference for `@for` when count changes. */
  readonly placeholders = computed(() =>
    Array.from({ length: Math.max(0, this.count()) }),
  );
}
