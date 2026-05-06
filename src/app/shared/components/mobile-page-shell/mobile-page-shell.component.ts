import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

/**
 * Shared mobile page shell that wraps a native page with the standard
 * iOS-style header, scrollable content slot, and bottom tab navbar.
 *
 * Use as a drop-in container for native-only pages or @if (isNative)
 * branches inside shared pages. Web pages must keep using the dashboard
 * shell — this component is mobile-only.
 *
 * The shell listens to <ion-content> scroll events and forwards a
 * `scrolled` signal to <app-mobile-header> so the topbar can apply
 * glassmorphism (translucent + blur) when the user scrolls.
 */
@Component({
  selector: 'app-mobile-page-shell',
  standalone: true,
  imports: [CommonModule, IonicModule, MobileHeaderComponent, NavbarComponent],
  host: { class: 'ion-page' },
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar
        [style.--padding-top]="0"
        [style.--padding-bottom]="0"
        [style.--padding-start]="0"
        [style.--padding-end]="0"
        [style.--min-height]="0"
      >
        <app-mobile-header
          [title]="title()"
          [showBack]="showBack()"
          [actionIcon]="actionIcon()"
          [actionLabel]="actionLabel()"
          [actionDisabled]="actionDisabled()"
          [showCart]="showCart()"
          [showSearch]="showSearch()"
          [scrolled]="scrolled()"
          (actionClick)="actionClick.emit()"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content
      [fullscreen]="true"
      [scrollEvents]="true"
      (ionScroll)="onScroll($event)"
    >
      <ng-content />
    </ion-content>

    @if (showNavbar()) {
      <ion-footer class="ion-no-border">
        <app-navbar />
      </ion-footer>
    }
  `,
})
export class MobilePageShellComponent {
  /** i18n key for the centered title. */
  title = input<string>('');
  /** Show back button instead of logo on the left. */
  showBack = input<boolean>(false);
  /** Render the bottom navbar (only false for sub-pages without nav). */
  showNavbar = input<boolean>(true);
  /** Single right-side icon action (e.g. trash). */
  actionIcon = input<string | null>(null);
  actionLabel = input<string>('Action');
  actionDisabled = input<boolean>(false);
  /** Show cart icon on the right. */
  showCart = input<boolean>(false);
  /** Show magnifier icon on the right. */
  showSearch = input<boolean>(false);

  @Output() actionClick = new EventEmitter<void>();

  protected scrolled = signal(false);

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    const next = top > 0;
    if (next !== this.scrolled()) {
      this.scrolled.set(next);
    }
  }
}
