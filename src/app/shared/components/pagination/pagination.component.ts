import { Component, input, output, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 pb-4">
        <!-- Previous -->
        <button
          (click)="goTo(currentPage() - 1)"
          [disabled]="currentPage() <= 1"
          class="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="hidden sm:inline">{{ 'CATALOG.PREV' | translate }}</span>
        </button>

        <!-- Page numbers -->
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-1 text-text-muted">...</span>
          } @else {
            <button
              (click)="goTo(page)"
              class="min-w-[36px] h-9 flex items-center justify-center text-sm rounded-lg border transition-colors"
              [class]="
                page === currentPage()
                  ? 'bg-primary text-text-inverse border-primary font-semibold'
                  : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:text-primary'
              "
            >
              {{ page }}
            </button>
          }
        }

        <!-- Next -->
        <button
          (click)="goTo(currentPage() + 1)"
          [disabled]="currentPage() >= totalPages()"
          class="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <span class="hidden sm:inline">{{ 'CATALOG.NEXT' | translate }}</span>
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </nav>
    }
  `,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];

    pages.push(1);

    if (current > 3) {
      pages.push(-1); // ellipsis
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push(-1); // ellipsis
    }

    pages.push(total);

    return pages;
  });

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
