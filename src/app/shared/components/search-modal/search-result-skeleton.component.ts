import { Component } from '@angular/core';

@Component({
  selector: 'app-search-result-skeleton',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="flex items-center gap-3 px-4 py-3">
      <div class="h-10 w-10 shrink-0 rounded-lg bg-border-light shimmer"></div>
      <div class="flex flex-1 flex-col gap-1.5">
        <div class="h-4 w-2/3 rounded bg-border-light shimmer"></div>
        <div class="h-3 w-1/3 rounded bg-border-light shimmer"></div>
      </div>
      <div class="h-4 w-12 rounded bg-border-light shimmer"></div>
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
export class SearchResultSkeletonComponent {}
