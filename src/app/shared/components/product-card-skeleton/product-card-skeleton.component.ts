import { Component, input } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div
      class="flex flex-col rounded-2xl bg-surface border border-border/50 overflow-hidden"
      [style.width]="fullWidth() ? '100%' : '190px'"
    >
      <!-- Image skeleton -->
      <div
        class="relative w-full bg-border-light shimmer"
        style="aspect-ratio: 3/2"
      ></div>

      <!-- Content skeleton -->
      <div class="flex flex-col gap-1.5 p-3">
        <!-- Title -->
        <div class="flex items-start justify-between gap-1.5">
          <div class="h-4 bg-border-light rounded shimmer flex-1"></div>
          <div
            class="w-1.5 h-1.5 rounded-full bg-border-light mt-1.5 shrink-0"
          ></div>
        </div>

        <!-- Description -->
        <div class="h-3 bg-border-light rounded shimmer w-3/4"></div>

        <!-- Price + CTA -->
        <div
          class="flex items-center justify-between mt-auto pt-2 border-t border-border/40"
        >
          <div class="h-4 w-14 bg-border-light rounded shimmer"></div>
          <div class="h-6 w-12 bg-border-light rounded-full shimmer"></div>
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
