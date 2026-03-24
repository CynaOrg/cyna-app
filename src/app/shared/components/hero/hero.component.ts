import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  host: { class: 'block' },
  styles: `
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fade-in-scale {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(16px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .anim-1 {
      animation: fade-in-up 0.6s ease-out 0.1s both;
    }
    .anim-2 {
      animation: fade-in-up 0.6s ease-out 0.25s both;
    }
    .anim-3 {
      animation: fade-in-up 0.6s ease-out 0.4s both;
    }
    .anim-mockup {
      animation: fade-in-scale 0.8s ease-out 0.45s both;
    }
  `,
  template: `
    <section class="w-full bg-white">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center px-6 pt-8 md:px-8 md:pt-12 lg:pt-20"
      >
        <h1
          class="anim-1 max-w-3xl text-center font-semibold leading-tight"
          style="font-size: clamp(28px, 5vw, 56px); color: #0a0a0a;"
        >
          {{ 'HERO.TITLE_LINE1' | translate
          }}<span style="color: #4f39f6; font-family: 'Qurova', sans-serif;">{{
            'HERO.TITLE_HIGHLIGHT' | translate
          }}</span>
        </h1>

        <p
          class="anim-2 mt-4 max-w-lg text-center leading-relaxed md:mt-5"
          style="font-size: clamp(14px, 1.5vw, 18px); color: #6b7280;"
        >
          {{ 'HERO.SUBTITLE' | translate }}
        </p>

        <div
          class="anim-3 mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:mt-8"
        >
          <a
            routerLink="/products"
            class="inline-flex w-full items-center justify-center rounded-full font-semibold transition-colors hover:opacity-90 sm:w-auto"
            style="padding: 14px 36px; font-size: 15px; color: #ffffff; background-color: #4f39f6; text-decoration: none;"
          >
            {{ 'HERO.CTA' | translate }}
          </a>
          <a
            routerLink="/contact"
            class="inline-flex w-full items-center justify-center rounded-full font-semibold transition-colors hover:bg-gray-50 sm:w-auto"
            style="padding: 14px 36px; font-size: 15px; color: #0a0a0a; border: 1px solid #e5e5e5; text-decoration: none;"
          >
            {{ 'HERO.CTA_SECONDARY' | translate }}
          </a>
        </div>

        <!-- Shadow wrapper: clips shadow on the bottom so it only shows top + sides -->
        <div
          class="anim-mockup mt-8 w-full max-w-5xl md:mt-14"
          style="clip-path: inset(-40px -40px 0 -40px);"
        >
          <div
            class="rounded-t-xl overflow-hidden shadow-2xl ring-1 ring-black/[0.04] md:rounded-t-2xl"
            style="height: clamp(220px, 40vw, 480px);"
          >
            <img
              src="assets/images/landing/hero-dashboard.png"
              alt="Cybersecurity dashboard"
              class="w-full"
              style="display: block;"
            />
          </div>
        </div>
      </div>

      <!-- Gradient overlay bridging hero → next section -->
      <div
        class="pointer-events-none relative z-10 w-full"
        style="height: 80px; margin-top: -80px; background: linear-gradient(to bottom, transparent, #ffffff);"
        aria-hidden="true"
      ></div>
    </section>
  `,
})
export class HeroComponent {}
