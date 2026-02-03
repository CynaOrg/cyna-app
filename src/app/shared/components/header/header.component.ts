import { Component, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorMagnifyingGlass,
  phosphorShoppingCart,
} from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [
    provideIcons({ phosphorMagnifyingGlass, phosphorShoppingCart }),
  ],
  template: `
    <header
      class="flex h-[80px] w-full items-center justify-between bg-white px-8 py-2.5"
    >
      <img
        src="assets/cyna-logo.svg"
        alt="CYNA"
        class="h-8 w-8"
      />

      <div class="flex items-center gap-2.5">
        <button
          class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6]"
          aria-label="Search"
        >
          <ng-icon name="phosphorMagnifyingGlass" size="18" />
        </button>

        <button
          class="relative flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#f6f6f6]"
          aria-label="Cart"
        >
          <ng-icon name="phosphorShoppingCart" size="18" />
          @if (cartCount() > 0) {
            <span
              class="absolute right-0 top-0 flex h-3 w-3 items-center justify-center rounded-full bg-[#4f39f6] text-[8px] leading-none text-white"
            >
              {{ cartCount() }}
            </span>
          }
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  cartCount = input(0);
}
