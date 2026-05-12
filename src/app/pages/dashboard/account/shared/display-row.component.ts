import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-display-row',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './display-row.component.html',
})
export class DisplayRowComponent {
  label = input.required<string>();
  value = input<string | null | undefined>(null);

  get hasValue(): boolean {
    const v = this.value();
    return v !== null && v !== undefined && v !== '';
  }
}
