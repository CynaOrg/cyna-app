import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  viewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslateModule, ButtonComponent],
  template: `
    <div
      class="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'confirm-dialog-title'"
    >
      <div
        class="absolute inset-0 bg-black/50"
        (click)="onCancel()"
        aria-hidden="true"
      ></div>

      <div
        #dialog
        tabindex="-1"
        class="relative w-full max-w-sm rounded-2xl border border-border-light bg-surface p-6 shadow-2xl"
      >
        <h2
          id="confirm-dialog-title"
          class="text-lg font-semibold text-text-primary"
        >
          {{ title() | translate }}
        </h2>
        <p class="mt-2 text-sm text-text-secondary">
          {{ message() | translate }}
        </p>

        <div
          class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <div class="sm:w-auto">
            <app-button
              variant="outline"
              [label]="cancelLabel() | translate"
              (clicked)="onCancel()"
            />
          </div>
          <div class="sm:w-auto">
            <app-button
              [color]="destructive() ? '#EF4444' : undefined"
              [label]="confirmLabel() | translate"
              (clicked)="onConfirm()"
            />
          </div>
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

  private readonly dialogRef = viewChild<ElementRef<HTMLDivElement>>('dialog');
  private previousBodyOverflow: string | null = null;

  ngAfterViewInit(): void {
    document.body.appendChild(this.host.nativeElement);
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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
