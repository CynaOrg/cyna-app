import { Component } from '@angular/core';

interface Logo {
  name: string;
  viewBox: string;
  path: string;
}

@Component({
  selector: 'app-trusted-by',
  standalone: true,
  host: { class: 'block' },
  styles: [
    `
      .marquee-container {
        display: flex;
        overflow: hidden;
        user-select: none;
      }

      .marquee-content {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-around;
        min-width: 100%;
        animation: scroll 25s linear infinite;
      }

      .marquee-container:hover .marquee-content {
        animation-play-state: paused;
      }

      .logo-item {
        flex-shrink: 0;
        padding: 0 3rem;
      }

      @keyframes scroll {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-100%);
        }
      }
    `,
  ],
  template: `
    <section style="background-color: #f9f9f9" class="w-full py-10 md:py-14">
      <!-- Section title -->
      <p
        class="mb-8 text-center text-sm font-medium uppercase tracking-widest md:mb-10"
        style="color: #6b7280"
      >
        Ils nous font confiance
      </p>

      <!-- Mobile: Static grid -->
      <div class="block px-6 md:hidden">
        <!-- Row 1: 3 logos -->
        <div class="mb-6 flex items-center justify-center gap-8">
          @for (logo of mobileRow1; track logo.name) {
            <svg
              [attr.aria-label]="logo.name"
              role="img"
              [attr.viewBox]="logo.viewBox"
              class="h-6 w-auto"
              style="fill: #0A0A0A"
            >
              <path [attr.d]="logo.path" />
            </svg>
          }
        </div>
        <!-- Row 2: 2 logos centered -->
        <div class="flex items-center justify-center gap-8">
          @for (logo of mobileRow2; track logo.name) {
            <svg
              [attr.aria-label]="logo.name"
              role="img"
              [attr.viewBox]="logo.viewBox"
              class="h-6 w-auto"
              style="fill: #0A0A0A"
            >
              <path [attr.d]="logo.path" />
            </svg>
          }
        </div>
      </div>

      <!-- Desktop: Seamless infinite marquee -->
      <!-- Two identical content blocks side by side, each animates -100% of its own width -->
      <!-- This creates seamless loop: when first exits left, second takes its place -->
      <div class="marquee-container hidden md:flex">
        <!-- First set -->
        <div class="marquee-content">
          @for (logo of allLogos; track logo.name) {
            <div class="logo-item">
              <svg
                [attr.aria-label]="logo.name"
                role="img"
                [attr.viewBox]="logo.viewBox"
                class="h-8 w-auto"
                style="fill: #0A0A0A"
              >
                <path [attr.d]="logo.path" />
              </svg>
            </div>
          }
        </div>
        <!-- Second set (duplicate for seamless loop) -->
        <div class="marquee-content" aria-hidden="true">
          @for (logo of allLogos; track logo.name + '-dup') {
            <div class="logo-item">
              <svg
                [attr.aria-label]="logo.name"
                role="img"
                [attr.viewBox]="logo.viewBox"
                class="h-8 w-auto"
                style="fill: #0A0A0A"
              >
                <path [attr.d]="logo.path" />
              </svg>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class TrustedByComponent {
  // SVG paths from Simple Icons (https://simpleicons.org/) - CC0 1.0 License
  readonly allLogos: Logo[] = [
    {
      name: 'Google',
      viewBox: '0 0 24 24',
      path: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z',
    },
    {
      name: 'Amazon',
      viewBox: '0 0 24 24',
      path: 'M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z',
    },
    {
      name: 'Netflix',
      viewBox: '0 0 24 24',
      path: 'M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z',
    },
    {
      name: 'Microsoft',
      viewBox: '0 0 24 24',
      path: 'M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z',
    },
    {
      name: 'Apple',
      viewBox: '0 0 24 24',
      path: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
    },
    {
      name: 'Tesla',
      viewBox: '0 0 24 24',
      path: 'M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362l-.004.002zm0-3.899c3.415-.03 7.326.528 11.142 2.478.77-1.452.858-2.477.858-2.477C19.279.263 14.058 0 12 0S4.721.263 0 1.464c0 0 .088 1.025.858 2.477C4.674 1.99 8.585 1.432 12 1.463z',
    },
  ];

  // Mobile layout: Row 1 (3 logos) + Row 2 (2 logos)
  readonly mobileRow1 = this.allLogos.slice(0, 3); // Google, Amazon, Netflix
  readonly mobileRow2 = this.allLogos.slice(4, 6); // Apple, Tesla
}
