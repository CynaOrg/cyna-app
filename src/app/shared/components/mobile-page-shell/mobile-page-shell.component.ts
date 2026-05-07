import {
  Component,
  DestroyRef,
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

  protected readonly contentPaddingTop =
    'calc(env(safe-area-inset-top) + 80px)';

  constructor() {
    effect(() => {
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
    });
  }

  ngOnInit(): void {
    this.header.actionClick$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actionClick.emit());
  }

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    this.header.setScrolled(top > 50);
  }
}
