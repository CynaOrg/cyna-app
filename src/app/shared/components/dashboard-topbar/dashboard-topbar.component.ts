import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TopbarActionsComponent } from '../topbar-actions/topbar-actions.component';

@Component({
  selector: 'app-dashboard-topbar',
  standalone: true,
  imports: [TranslateModule, TopbarActionsComponent],
  template: `
    <div
      class="flex items-center justify-between border-b border-border-light bg-surface px-6 py-4 lg:px-8"
    >
      @if (title()) {
        <div>
          <h1 class="!m-0 text-xl font-bold text-text-primary">
            {{ title() | translate }}
          </h1>
          @if (subtitle()) {
            <p class="!m-0 mt-0.5 text-sm text-text-secondary">
              {{ subtitle() | translate }}
            </p>
          }
        </div>
      } @else {
        <div></div>
      }
      <div class="hidden items-center gap-3 lg:flex">
        <app-topbar-actions />
      </div>
    </div>
  `,
})
export class DashboardTopBarComponent {
  title = input<string>('');
  subtitle = input<string>('');
}
