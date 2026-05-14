import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="rounded-2xl border border-border-light bg-surface p-6 sm:p-7"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <div class="h-4 w-40 rounded bg-border-light animate-pulse"></div>
        <div class="h-4 w-10 rounded bg-border-light animate-pulse"></div>
      </div>
      <div class="flex flex-col gap-4">
        @for (i of rows(); track i) {
          <div
            class="grid gap-1 py-3 lg:grid-cols-[180px_1fr] lg:items-baseline lg:gap-4 lg:py-2"
          >
            <div class="h-3 w-24 rounded bg-border-light animate-pulse"></div>
            <div class="h-4 w-3/5 rounded bg-border-light animate-pulse"></div>
          </div>
        }
      </div>
    </section>
  `,
})
export class SectionSkeletonComponent {
  rowCount = input<number>(3);

  rows(): number[] {
    return Array.from({ length: this.rowCount() }, (_, i) => i);
  }
}
