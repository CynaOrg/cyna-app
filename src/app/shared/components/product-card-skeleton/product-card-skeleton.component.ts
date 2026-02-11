import { Component, input } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div
      class="flex flex-col rounded-xl bg-surface border border-border/30 shadow-sm overflow-hidden"
      [style.width]="fullWidth() ? '100%' : '160px'"
    >
      <!-- Image skeleton -->
      <div
        class="relative w-full bg-border-light shimmer"
        style="aspect-ratio: 3/2"
      ></div>

      <!-- Content skeleton -->
      <div class="flex flex-col gap-1 p-2.5">
        <!-- Title -->
        <div class="h-3.5 bg-border-light rounded shimmer w-4/5"></div>
        <!-- Description -->
        <div class="h-3 bg-border-light rounded shimmer w-3/5"></div>
        <!-- Price row -->
        <div class="flex items-center justify-between pt-1.5">
          <div class="h-4 w-12 bg-border-light rounded shimmer"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-border-light"></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .shimmer {
      background: linear-gradient(
        90deg,
        var(--color-border-light) 25%,
        var(--color-border) 50%,
        var(--color-border-light) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `,
})
export class ProductCardSkeletonComponent {
  fullWidth = input<boolean>(false);
}
