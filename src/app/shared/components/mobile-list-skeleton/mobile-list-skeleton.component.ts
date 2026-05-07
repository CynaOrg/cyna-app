import { Component, computed, input } from '@angular/core';

/**
 * Generic skeleton placeholder for vertical card lists on native pages
 * (orders, subscriptions, licenses, addresses, …). Mirrors the card chrome
 * used by those pages — rounded surface, two stacked text lines and a
 * trailing chip — so the layout doesn't jump when real data arrives.
 *
 * Usage:
 *   <app-mobile-list-skeleton [count]="4" />
 *   <app-mobile-list-skeleton variant="address" />
 *   <app-mobile-list-skeleton variant="form" />
 */
@Component({
  selector: 'app-mobile-list-skeleton',
  standalone: true,
  template: `
    <div class="flex flex-col gap-2 px-4 py-4">
      @for (i of items(); track i) {
        @if (variant() === 'address') {
          <div class="animate-pulse rounded-2xl bg-surface p-4">
            <div class="mb-3 flex items-center justify-between">
              <div class="h-4 w-32 rounded bg-border-light"></div>
              <div class="h-6 w-16 rounded-full bg-border-light"></div>
            </div>
            <div class="mb-2 h-3 w-40 rounded bg-border-light"></div>
            <div class="mb-2 h-3 w-56 rounded bg-border-light"></div>
            <div class="h-3 w-32 rounded bg-border-light"></div>
          </div>
        } @else if (variant() === 'form') {
          <div class="animate-pulse rounded-2xl bg-surface p-4">
            <div class="mb-2 h-3 w-24 rounded bg-border-light"></div>
            <div class="h-10 w-full rounded-lg bg-border-light"></div>
          </div>
        } @else {
          <div class="animate-pulse rounded-2xl bg-surface p-4">
            <div class="mb-3 flex items-center justify-between gap-2">
              <div class="h-4 w-40 rounded bg-border-light"></div>
              <div class="h-5 w-20 rounded-full bg-border-light"></div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="h-3 w-32 rounded bg-border-light"></div>
              <div class="h-3 w-16 rounded bg-border-light"></div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class MobileListSkeletonComponent {
  count = input<number>(3);
  variant = input<'list-row' | 'address' | 'form'>('list-row');

  protected readonly items = computed(() =>
    Array.from({ length: this.count() }, (_, i) => i),
  );
}
