import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { phosphorArrowLeft } from '@ng-icons/phosphor-icons/regular';
import { TranslateModule } from '@ngx-translate/core';
import { TopbarActionsComponent } from '../topbar-actions/topbar-actions.component';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  imports: [TranslateModule, TopbarActionsComponent, NgIconComponent],
  viewProviders: [provideIcons({ phosphorArrowLeft })],
  template: `
    <div
      class="relative border-b border-border-light bg-surface lg:sticky lg:top-0 lg:z-20"
    >
      <!-- Title row -->
      <div class="flex items-center justify-between px-6 py-4 lg:px-8">
        <div class="flex items-center gap-3 min-w-0">
          @if (showBack()) {
            <button
              class="flex h-9 w-9 shrink-0 items-center justify-center !rounded-full bg-[#f6f6f6] transition-colors hover:bg-primary-light"
              style="color: #0a0a0a; border: none; cursor: pointer"
              (click)="goBack()"
            >
              <ng-icon name="phosphorArrowLeft" size="18" />
            </button>
          }
          @if (title()) {
            <div class="min-w-0">
              <h1 class="!m-0 truncate text-xl font-bold text-text-primary">
                {{ title() | translate }}
              </h1>
              @if (subtitle()) {
                <p class="!m-0 mt-0.5 text-sm text-text-secondary">
                  {{ subtitle() | translate }}
                </p>
              }
            </div>
          }
        </div>
        <!-- Desktop actions only -->
        <div class="hidden items-center gap-3 lg:flex">
          <app-topbar-actions cartRoute="/dashboard/cart" />
        </div>
      </div>
    </div>
  `,
})
export class DashboardTopBarComponent {
  private readonly location = inject(Location);

  title = input<string>('');
  subtitle = input<string>('');
  showBack = input<boolean>(false);

  goBack(): void {
    this.location.back();
  }
}
