import { Component, inject, input, output } from '@angular/core';
import { Location } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';

/**
 * Native page header with optional back button and trailing slot.
 *
 * Used by all `/m/*` content pages that need a title bar but are not the
 * tabbed root (which uses the shared `app-mobile-header`). Kept inside
 * `src/app/native/` so it can never bleed into the web bundle.
 */
@Component({
  selector: 'app-native-page-header',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [provideIcons({ phosphorArrowLeft })],
  template: `
    <header
      class="sticky top-0 z-30 flex items-center gap-2 px-4"
      style="
        height: 60px;
        padding-top: env(safe-area-inset-top, 0px);
        background-color: #ffffff;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      "
    >
      @if (showBack()) {
        <button
          type="button"
          (click)="onBack()"
          class="flex items-center justify-center !rounded-full"
          style="width: 38px; height: 38px; background-color: #f6f6f6;"
          aria-label="Back"
        >
          <ng-icon
            name="phosphorArrowLeft"
            style="font-size: 20px; color: #0a0a0a;"
          />
        </button>
      }
      <h1
        class="flex-1 text-center text-lg font-bold truncate"
        style="color: #0a0a0a;"
      >
        {{ title() }}
      </h1>
      <div class="w-[38px]">
        <ng-content />
      </div>
    </header>
  `,
})
export class NativePageHeaderComponent {
  private readonly location = inject(Location);

  title = input<string>('');
  showBack = input<boolean>(true);
  back = output<void>();

  onBack(): void {
    this.back.emit();
    this.location.back();
  }
}
