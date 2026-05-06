import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  MobileHeaderComponent,
  MobileHeaderVariant,
} from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

/**
 * Shared mobile page shell that wraps a native page with the standard
 * iOS-style header, scrollable content slot, and bottom tab navbar.
 *
 * Use as a drop-in container for native-only pages or @if (isNative)
 * branches inside shared pages. Web pages must keep using the dashboard
 * shell — this component is mobile-only.
 */
@Component({
  selector: 'app-mobile-page-shell',
  standalone: true,
  imports: [CommonModule, IonicModule, MobileHeaderComponent, NavbarComponent],
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
          [variant]="variant()"
          [title]="title()"
          [actionIcon]="actionIcon()"
          [actionLabel]="actionLabel()"
          [actionDisabled]="actionDisabled()"
          (actionClick)="actionClick.emit()"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
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
  variant = input<MobileHeaderVariant>('back');
  title = input<string>('');
  showNavbar = input<boolean>(true);
  actionIcon = input<string | null>(null);
  actionLabel = input<string>('Action');
  actionDisabled = input<boolean>(false);

  @Output() actionClick = new EventEmitter<void>();
}
