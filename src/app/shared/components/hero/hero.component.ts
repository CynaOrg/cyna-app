import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TranslateModule],
  host: { class: 'block' },
  template: `
    <section
      class="relative flex w-full flex-col items-center gap-16 overflow-visible px-8 pb-16 md:px-6"
    >
      <!-- Hero content -->
      <div class="relative z-10 flex w-full flex-col items-center gap-6">
        <!-- Title + Subtitle -->
        <div class="flex w-full flex-col items-center gap-1 text-center">
          <h1
            class="max-w-[600px] font-bold leading-tight md:max-w-[700px] lg:max-w-[800px]"
            style="
              color: #0a0a0a;
              font-size: clamp(40px, 5vw, 72px);
              font-family: 'Qurova', sans-serif;
            "
          >
            {{ 'HERO.TITLE_START' | translate }}
            <span style="color: #4f39f6">{{
              'HERO.TITLE_HIGHLIGHT' | translate
            }}</span>
            {{ 'HERO.TITLE_END' | translate }}
          </h1>
          <p
            class="max-w-[280px] leading-normal md:max-w-none"
            style="color: #454545; font-size: clamp(22px, 2.5vw, 28px)"
          >
            {{ 'HERO.SUBTITLE' | translate }}
          </p>
        </div>

        <!-- CTA Button -->
        <div class="w-auto">
          <a routerLink="/products" class="no-underline">
            <app-button variant="primary">
              <span style="font-size: 18px; padding: 4px 16px">{{
                'HERO.CTA' | translate
              }}</span>
            </app-button>
          </a>
        </div>
      </div>

      <!-- Mockup with glow behind -->
      <div class="relative flex items-center justify-center overflow-visible">
        <!-- Glow — two overlapping blurred circles (Figma node 124:230) -->
        <div
          class="pointer-events-none absolute inset-0 overflow-visible"
          aria-hidden="true"
        >
          <div
            class="absolute rounded-full"
            style="
              width: 300px;
              height: 300px;
              top: 50%;
              left: 50%;
              transform: translate(-100%, -50%);
              background: rgba(202, 174, 251, 0.7);
              filter: blur(80px);
            "
          ></div>
          <div
            class="absolute rounded-full"
            style="
              width: 300px;
              height: 300px;
              top: 50%;
              left: 50%;
              transform: translate(0%, -50%);
              background: rgba(79, 57, 246, 0.5);
              filter: blur(80px);
            "
          ></div>
        </div>
        <!-- Mockup -->
        <img
          src="assets/home-mockup.webp"
          alt="CYNA application mockup"
          class="relative z-10 h-[526px] w-[254px] object-cover md:h-[580px] md:w-[280px] lg:h-[640px] lg:w-[310px]"
        />
      </div>
    </section>
  `,
})
export class HeroComponent {}
