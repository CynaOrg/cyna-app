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
 *
 * Layout pattern (matches web browser-header):
 *  - <app-mobile-header> is rendered as a sibling of <ion-content> (not
 *    wrapped in <ion-header>/<ion-toolbar>). The header positions itself
 *    `fixed top-0` over the content via its own host classes. This mirrors
 *    the web pattern where the header is a fixed-positioned element above
 *    the page flow rather than reserving layout space.
 *  - <ion-content [fullscreen]="true"> fills the viewport and applies a
 *    static padding-top equal to `safe-area-top + 80px` so the at-top
 *    header zone never overlaps content. When the floating pill collapses
 *    to 60px on scroll, the extra ~20px breathing room mirrors the web
 *    spacer behavior.
 */
@Component({
  selector: 'app-mobile-page-shell',
  standalone: true,
  imports: [CommonModule, IonicModule, MobileHeaderComponent, NavbarComponent],
  host: { class: 'ion-page' },
  template: `
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

    <ion-content
      [fullscreen]="true"
      [scrollEvents]="true"
      [style.--padding-top]="contentPaddingTop"
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

  /**
   * Static padding-top for <ion-content> so the at-top (80px) header
   * never overlaps content. Matches the web spacer pattern (h-[80px]).
   * When the pill collapses to 60px on scroll, the extra ~20px is the
   * breathing room that mirrors the web layout.
   */
  protected readonly contentPaddingTop =
    'calc(env(safe-area-inset-top) + 80px)';

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    const next = top > 50;
    if (next !== this.scrolled()) {
      this.scrolled.set(next);
    }
  }
}
