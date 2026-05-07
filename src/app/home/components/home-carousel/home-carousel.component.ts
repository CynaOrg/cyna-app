import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CarouselService } from '@core/services/carousel.service';
import { CarouselSlide } from '@core/interfaces/carousel.interface';

const AUTO_SCROLL_INTERVAL_MS = 5000;

@Component({
  selector: 'app-home-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (slides().length > 0) {
      <section>
        <div class="relative h-[200px] overflow-hidden rounded-2xl bg-black/5">
          <div
            #track
            class="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
            style="scrollbar-width: none;"
            (scroll)="onScroll()"
          >
            @for (slide of slides(); track slide.id) {
              <div class="relative flex h-full w-full shrink-0 snap-start">
                @if (slide.imageUrl) {
                  <img
                    [src]="slide.imageUrl"
                    [alt]="slide.titleFr"
                    class="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                }
                <div class="absolute inset-0 bg-black/35"></div>
                <div
                  class="relative z-10 flex h-full w-full flex-col justify-center p-5"
                >
                  @if (slide.subtitleFr) {
                    <span
                      class="mb-2 text-xs font-medium uppercase tracking-wider text-white/90"
                    >
                      {{ slide.subtitleFr }}
                    </span>
                  }
                  <h2 class="text-2xl font-bold leading-tight text-white">
                    {{ slide.titleFr }}
                  </h2>
                </div>
              </div>
            }
          </div>

          @if (slides().length > 1) {
            <div
              class="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
            >
              @for (slide of slides(); track slide.id; let i = $index) {
                <span
                  class="h-1.5 rounded-full bg-white transition-all duration-300"
                  [class.w-4]="activeIndex() === i"
                  [class.w-1.5]="activeIndex() !== i"
                  [class.opacity-100]="activeIndex() === i"
                  [class.opacity-50]="activeIndex() !== i"
                ></span>
              }
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      div[style*='scrollbar-width']::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class HomeCarouselComponent implements OnDestroy {
  private readonly carouselService = inject(CarouselService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly track = viewChild<ElementRef<HTMLDivElement>>('track');
  protected readonly slides = signal<CarouselSlide[]>([]);
  protected readonly activeIndex = signal(0);

  private autoScrollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.carouselService
      .getActiveSlides('fr')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (slides) => this.slides.set(slides ?? []),
        error: () => this.slides.set([]),
      });

    effect(() => {
      const hasSlides = this.slides().length > 0;
      const trackEl = this.track()?.nativeElement;
      if (hasSlides && trackEl) {
        trackEl.scrollLeft = 0;
        this.activeIndex.set(0);
        if (this.slides().length > 1) {
          this.startAutoScroll();
        }
      } else {
        this.stopAutoScroll();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  protected onScroll(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const slideWidth = el.clientWidth;
    if (slideWidth === 0) return;
    const idx = Math.round(el.scrollLeft / slideWidth);
    if (idx !== this.activeIndex()) {
      this.activeIndex.set(idx);
    }
  }

  private startAutoScroll(): void {
    this.stopAutoScroll();
    if (this.slides().length <= 1) return;
    this.autoScrollTimer = setInterval(() => {
      const el = this.track()?.nativeElement;
      if (!el) return;
      const total = this.slides().length;
      const next = (this.activeIndex() + 1) % total;
      el.scrollTo({
        left: next * el.clientWidth,
        behavior: 'smooth',
      });
    }, AUTO_SCROLL_INTERVAL_MS);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollTimer) {
      clearInterval(this.autoScrollTimer);
      this.autoScrollTimer = null;
    }
  }
}
