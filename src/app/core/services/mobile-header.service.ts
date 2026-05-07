import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface MobileHeaderConfig {
  showBack?: boolean;
  title?: string;
  showSearch?: boolean;
  showCart?: boolean;
  actionIcon?: string | null;
  actionLabel?: string;
  actionDisabled?: boolean;
  visible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MobileHeaderService {
  readonly showBack = signal(false);
  readonly title = signal('');
  readonly showSearch = signal(false);
  readonly showCart = signal(false);
  readonly actionIcon = signal<string | null>(null);
  readonly actionLabel = signal('Action');
  readonly actionDisabled = signal(false);
  readonly scrolled = signal(false);
  readonly visible = signal(false);
  /** When true, the bottom navbar pill is hidden (e.g. while a bottom-sheet
      modal is open so it doesn't overlap the sheet content). */
  readonly navbarHidden = signal(false);

  private readonly _actionClick = new Subject<void>();
  readonly actionClick$ = this._actionClick.asObservable();

  configure(c: MobileHeaderConfig): void {
    this.showBack.set(c.showBack ?? false);
    this.title.set(c.title ?? '');
    this.showSearch.set(c.showSearch ?? false);
    this.showCart.set(c.showCart ?? false);
    this.actionIcon.set(c.actionIcon ?? null);
    this.actionLabel.set(c.actionLabel ?? 'Action');
    this.actionDisabled.set(c.actionDisabled ?? false);
    this.visible.set(c.visible ?? true);
    this.scrolled.set(false);
  }

  setActionDisabled(v: boolean): void {
    this.actionDisabled.set(v);
  }

  setScrolled(v: boolean): void {
    this.scrolled.set(v);
  }

  hide(): void {
    this.visible.set(false);
  }

  emitActionClick(): void {
    this._actionClick.next();
  }
}
