import {
  Component,
  EventEmitter,
  Output,
  booleanAttribute,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorCaretRight } from '@ng-icons/phosphor-icons/regular';

/**
 * iOS-style settings list item used inside grouped cards on native pages.
 *
 * Consumers wrap a group of items in a rounded card; pass `last=true` on
 * the final item to suppress the trailing separator.
 */
@Component({
  selector: 'app-mobile-list-item',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIconComponent],
  viewProviders: [provideIcons({ phosphorCaretRight })],
  template: `
    @if (routerLink()) {
      <a
        [routerLink]="routerLink()"
        class="flex items-center gap-3 px-4 py-3"
        style="text-decoration: none; color: inherit;"
      >
        @if (icon()) {
          <ng-icon [name]="icon()!" size="20" class="text-text-secondary" />
        }
        <span
          class="flex-1 text-left"
          [class.text-text-primary]="!destructive()"
          [class.text-red-600]="destructive()"
        >
          {{ label() | translate }}
        </span>
        @if (value()) {
          <span class="text-sm text-text-muted">{{ value() }}</span>
        }
        @if (chevron()) {
          <ng-icon
            name="phosphorCaretRight"
            size="16"
            class="text-text-muted"
          />
        }
      </a>
    } @else {
      <button
        type="button"
        (click)="onClick()"
        [disabled]="disabled()"
        class="flex w-full items-center gap-3 px-4 py-3 text-left disabled:opacity-50"
        style="background: transparent; border: none;"
      >
        @if (icon()) {
          <ng-icon [name]="icon()!" size="20" class="text-text-secondary" />
        }
        <span
          class="flex-1 text-left"
          [class.text-text-primary]="!destructive()"
          [class.text-red-600]="destructive()"
        >
          {{ label() | translate }}
        </span>
        @if (value()) {
          <span class="text-sm text-text-muted">{{ value() }}</span>
        }
        @if (chevron()) {
          <ng-icon
            name="phosphorCaretRight"
            size="16"
            class="text-text-muted"
          />
        }
      </button>
    }

    @if (!last()) {
      <div class="ml-12 border-b border-black/5"></div>
    }
  `,
})
export class MobileListItemComponent {
  icon = input<string | null>(null);
  label = input.required<string>();
  value = input<string | null>(null);
  routerLink = input<string | null>(null);
  chevron = input(true, { transform: booleanAttribute });
  destructive = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  last = input(false, { transform: booleanAttribute });

  @Output() itemClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled()) {
      this.itemClick.emit();
    }
  }
}
