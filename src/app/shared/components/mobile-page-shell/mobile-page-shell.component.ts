import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
  ViewChild,
  effect,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { IonContent, IonicModule } from '@ionic/angular';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  selector: 'app-mobile-page-shell',
  standalone: true,
  imports: [CommonModule, IonicModule],
  host: { class: 'ion-page' },
  template: `
    <ion-content
      #content
      [fullscreen]="true"
      [scrollEvents]="true"
      [style.--padding-top]="contentPaddingTop"
      (ionScroll)="onScroll($event)"
    >
      <ng-content />
    </ion-content>
  `,
})
export class MobilePageShellComponent implements OnInit {
  title = input<string>('');
  showBack = input<boolean>(false);
  showNavbar = input<boolean>(true);
  actionIcon = input<string | null>(null);
  actionLabel = input<string>('Action');
  actionDisabled = input<boolean>(false);
  showCart = input<boolean>(false);
  showSearch = input<boolean>(false);

  @Output() actionClick = new EventEmitter<void>();

  private readonly header = inject(MobileHeaderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  @ViewChild('content', { static: false }) content?: IonContent;

  /** Catches `ionViewWillEnter` when Ionic dispatches it on the shell host
      directly (works for /dashboard/* tabs). Pages routed at app root
      (`/account/profile`, `/account/addresses`, …) sometimes don't get this
      event on the shell — the Router-based fallback below handles those. */
  @HostListener('ionViewWillEnter')
  protected onIonViewWillEnter(): void {
    this.applyConfig();
  }

  protected readonly contentPaddingTop =
    'calc(env(safe-area-inset-top) + 80px)';

  constructor() {
    // React to dynamic input changes (e.g. async-loaded title from a store)
    // so the topbar updates without waiting for the next view-enter.
    effect(() => this.applyConfig());
  }

  ngOnInit(): void {
    this.header.actionClick$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actionClick.emit());
  }

  /** Public hook so a routed parent can force-refresh the topbar config
      on `ionViewWillEnter` (top-level account sub-pages need this — Ionic
      doesn't always dispatch the lifecycle event onto the shell host
      element, so the parent has to call it explicitly). */
  refresh(): void {
    this.applyConfig();
  }

  private applyConfig(): void {
    this.header.configure({
      showBack: this.showBack(),
      title: this.title(),
      showSearch: this.showSearch(),
      showCart: this.showCart(),
      actionIcon: this.actionIcon(),
      actionLabel: this.actionLabel(),
      actionDisabled: this.actionDisabled(),
      visible: true,
    });
    // `configure()` resets `scrolled` to false. When Ionic restores this
    // page from its router cache (e.g. user opened cart and pressed back),
    // ion-content keeps its scrollTop but ionScroll does not refire — so
    // re-evaluate it manually so the glassmorphism topbar reflects state.
    void this.syncScrolledState();
  }

  private async syncScrolledState(): Promise<void> {
    const el = await this.content?.getScrollElement();
    if (!el) return;
    this.header.setScrolled(el.scrollTop > 50);
  }

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
  }
}
