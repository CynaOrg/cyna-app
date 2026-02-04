import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorShoppingCart } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  viewProviders: [provideIcons({ phosphorShoppingCart })],
  host: { class: 'block' },
  template: `
    <section
      class="relative flex w-full flex-col items-center gap-16 overflow-visible px-8 pb-16 md:px-6"
    >
      <!-- Hero content -->
      <div class="relative z-10 flex w-full flex-col items-center gap-6">
        <!-- Title + Subtitle -->
        <div class="flex w-full flex-col items-center gap-4 text-center">
          <h1
            class="text-[40px] font-bold leading-normal"
            style="color: #0a0a0a"
          >
            La
            <span style="color: #4f39f6">protection</span>
            de votre entreprise commence ici
          </h1>
          <p class="text-[15px] leading-normal" style="color: #454545">
            Solutions de cybersécurité adaptées à vos enjeux.
          </p>
        </div>

        <!-- CTA Button -->
        <a
          routerLink="/products"
          class="inline-flex items-center justify-center gap-[5px] rounded-lg px-4 py-3"
          style="
            background-color: #4f39f6;
            color: #f9f9f9;
            text-decoration: none;
          "
        >
          <ng-icon name="phosphorShoppingCart" size="14" />
          <span class="text-sm font-bold leading-normal">
            Découvrir nos offres
          </span>
        </a>
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
              width: 280px;
              height: 280px;
              top: 50%;
              left: 50%;
              transform: translate(-100%, -50%);
              background: rgba(202, 174, 251, 0.7);
              filter: blur(60px);
            "
          ></div>
          <div
            class="absolute rounded-full"
            style="
              width: 280px;
              height: 280px;
              top: 50%;
              left: 50%;
              transform: translate(0%, -50%);
              background: rgba(79, 57, 246, 0.5);
              filter: blur(60px);
            "
          ></div>
        </div>
        <!-- Mockup -->
        <img
          src="assets/home-mockup.webp"
          alt="CYNA application mockup"
          class="relative z-10 h-[526px] w-[254px] object-cover"
        />
      </div>
    </section>
  `,
})
export class HeroComponent {}
