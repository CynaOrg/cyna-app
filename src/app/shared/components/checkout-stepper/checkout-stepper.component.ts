import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export type CheckoutStep = 1 | 2 | 3;

interface StepDef {
  index: CheckoutStep;
  labelKey: string;
}

/**
 * Compact 3-dots stepper for the mobile checkout flow.
 * - Active step: solid primary dot
 * - Completed step: solid primary dot (smaller)
 * - Pending step: muted dot
 * - Connectors fill primary up to the current step
 */
@Component({
  selector: 'app-checkout-stepper',
  standalone: true,
  imports: [TranslateModule, NgClass],
  template: `
    <nav
      class="flex flex-col items-center gap-2 w-full"
      aria-label="Checkout progress"
    >
      <div class="flex items-center w-full max-w-[260px]">
        @for (step of steps; track step.index; let last = $last) {
          <span
            class="rounded-full transition-colors"
            [ngClass]="
              step.index === current()
                ? 'h-2.5 w-2.5 bg-primary'
                : step.index < current()
                  ? 'h-2 w-2 bg-primary'
                  : 'h-2 w-2 bg-text-muted/30'
            "
            [attr.aria-current]="step.index === current() ? 'step' : null"
          ></span>
          @if (!last) {
            <span
              class="flex-1 h-px mx-1 transition-colors"
              [ngClass]="
                step.index < current() ? 'bg-primary' : 'bg-text-muted/20'
              "
            ></span>
          }
        }
      </div>
      <div class="flex items-center justify-between w-full max-w-[260px]">
        @for (step of steps; track step.index) {
          <span
            class="text-[11px] leading-tight"
            [ngClass]="
              step.index === current()
                ? 'text-text-primary font-medium'
                : 'text-text-muted'
            "
          >
            {{ step.labelKey | translate }}
          </span>
        }
      </div>
    </nav>
  `,
})
export class CheckoutStepperComponent {
  current = input.required<CheckoutStep>();

  readonly steps: StepDef[] = [
    { index: 1, labelKey: 'CHECKOUT.STEP_INFO' },
    { index: 2, labelKey: 'CHECKOUT.STEP_PAYMENT' },
    { index: 3, labelKey: 'CHECKOUT.STEP_CONFIRM' },
  ];
}
