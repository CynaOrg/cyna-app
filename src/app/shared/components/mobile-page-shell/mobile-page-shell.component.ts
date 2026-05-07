import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  effect,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MobileHeaderService } from '@core/services/mobile-header.service';

@Component({
  selector: 'app-mobile-page-shell',
  standalone: true,
  imports: [CommonModule, IonicModule],
  host: { class: 'ion-page' },
  template: `
    <ion-content
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

    // Re-apply this page's topbar config every time Ionic re-enters it
    // from its router cache. Without this, navigating from e.g.
    // /account/security to /cart and back would leave the cart's "Panier"
    // config sticky on the shared header — the effect() above only runs
    // on init / input change.
    //
    // Ionic dispatches `ionViewWillEnter` on the routed component element
    // (which IonRouterOutlet auto-tags with `.ion-page`). The shell itself
    // also has `.ion-page` via host config, so we have to look *above* the
    // shell to find the routed component element. Events do not bubble, so
    // listening on the shell directly would never fire.
    const startFrom =
      this.elRef.nativeElement.parentElement ?? this.elRef.nativeElement;
    const target =
      (startFrom.closest('.ion-page') as HTMLElement | null) ??
      this.elRef.nativeElement;
    const onEnter = () => this.applyConfig();
    target.addEventListener('ionViewWillEnter', onEnter);
    this.destroyRef.onDestroy(() =>
      target.removeEventListener('ionViewWillEnter', onEnter),
    );
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
  }

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
  }
}
