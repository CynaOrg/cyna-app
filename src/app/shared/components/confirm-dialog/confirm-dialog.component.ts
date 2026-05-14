import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div
      class="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'confirm-dialog-title'"
    >
      <div
        class="absolute inset-0 bg-black/50 transition-opacity duration-200"
        [class.opacity-100]="animateIn()"
        [class.opacity-0]="!animateIn()"
        (click)="onCancel()"
        aria-hidden="true"
      ></div>

      <div
        #dialog
        tabindex="-1"
        class="relative max-w-sm w-full mx-4 overflow-hidden rounded-xl border border-border-light bg-surface shadow-lg transition-all duration-200 ease-out"
        [class.opacity-100]="animateIn()"
        [class.scale-100]="animateIn()"
        [class.opacity-0]="!animateIn()"
        [class.scale-95]="!animateIn()"
      >
        <div class="p-5">
          <h3
            id="confirm-dialog-title"
            class="text-sm font-semibold text-text-primary leading-snug"
          >
            {{ title() | translate }}
          </h3>
          <p class="mt-1 text-[13px] text-text-secondary leading-relaxed">
            {{ message() | translate }}
          </p>
        </div>

        <div
          class="flex justify-end gap-2.5 px-5 py-3.5 bg-background border-t border-border-light"
        >
          <button
            type="button"
            (click)="onCancel()"
            class="px-3.5 py-1.5 text-[13px] font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-background transition-colors cursor-pointer"
          >
            {{ cancelLabel() | translate }}
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            class="px-3.5 py-1.5 text-[13px] font-medium text-white rounded-lg transition-colors cursor-pointer"
            [class.bg-error]="destructive()"
            [class.hover:bg-red-600]="destructive()"
            [class.bg-primary]="!destructive()"
            [class.hover:bg-primary-hover]="!destructive()"
          >
            {{ confirmLabel() | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  title = input.required<string>();
  message = input.required<string>();
  confirmLabel = input<string>('COMMON.CONFIRM');
  cancelLabel = input<string>('COMMON.CANCEL');
  destructive = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  readonly animateIn = signal(false);

  private readonly dialogRef = viewChild<ElementRef<HTMLDivElement>>('dialog');
  private previousBodyOverflow: string | null = null;

  ngAfterViewInit(): void {
    document.body.appendChild(this.host.nativeElement);
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() =>
      requestAnimationFrame(() => this.animateIn.set(true)),
    );
    queueMicrotask(() => this.dialogRef()?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    if (this.previousBodyOverflow !== null) {
      document.body.style.overflow = this.previousBodyOverflow;
    }
    const el = this.host.nativeElement as HTMLElement;
    el.parentNode?.removeChild(el);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onCancel();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
