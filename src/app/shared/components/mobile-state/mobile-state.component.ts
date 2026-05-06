import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  phosphorPackage,
  phosphorWarning,
  phosphorMagnifyingGlass,
} from '@ng-icons/phosphor-icons/regular';

export type MobileStateVariant = 'empty' | 'loading' | 'error';

/**
 * Centered placeholder block used inside `MobilePageShellComponent`
 * content slots to render the empty / loading / error states of a
 * mobile-only page in a consistent way.
 */
@Component({
  selector: 'app-mobile-state',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonicModule,
    TranslateModule,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      phosphorPackage,
      phosphorWarning,
      phosphorMagnifyingGlass,
    }),
  ],
  template: `
    <div
      class="flex min-h-[40vh] flex-col items-center justify-center px-6 text-center"
    >
      @if (variant() === 'loading') {
        <ion-spinner name="crescent" class="text-primary" />
        @if (title()) {
          <p class="mt-4 text-text-muted">{{ title()! | translate }}</p>
        }
      } @else {
        @if (icon()) {
          <ng-icon [name]="icon()!" size="56" class="mb-4 text-text-muted" />
        }
        @if (title()) {
          <h2 class="mb-2 text-xl font-semibold text-text-primary">
            {{ title()! | translate }}
          </h2>
        }
        @if (description()) {
          <p class="mb-6 text-text-muted">
            {{ description()! | translate }}
          </p>
        }
        @if (ctaLabel()) {
          @if (ctaRoute()) {
            <a
              [routerLink]="ctaRoute()"
              class="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              style="text-decoration: none;"
            >
              {{ ctaLabel()! | translate }}
            </a>
          } @else {
            <button
              type="button"
              (click)="ctaClick.emit()"
              class="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              style="border: none;"
            >
              {{ ctaLabel()! | translate }}
            </button>
          }
        }
      }
    </div>
  `,
})
export class MobileStateComponent {
  variant = input.required<MobileStateVariant>();
  icon = input<string | null>(null);
  title = input<string | null>(null);
  description = input<string | null>(null);
  ctaLabel = input<string | null>(null);
  ctaRoute = input<string | null>(null);

  @Output() ctaClick = new EventEmitter<void>();
}
