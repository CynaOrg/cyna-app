import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  signal,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-editable-section',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './editable-section.component.html',
})
export class EditableSectionComponent {
  @Input({ required: true }) titleKey!: string;
  @Input() canSave = true;
  @Input() saving = false;
  @Input() errorMessage: string | null = null;

  @ContentChild('view', { read: TemplateRef })
  viewTemplate!: TemplateRef<unknown>;
  @ContentChild('edit', { read: TemplateRef })
  editTemplate!: TemplateRef<unknown>;

  @Output() save = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditing = signal(false);

  enterEdit(): void {
    this.isEditing.set(true);
  }

  onCancel(): void {
    this.isEditing.set(false);
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (!this.canSave || this.saving) return;
    this.save.emit();
  }

  exitEdit(): void {
    this.isEditing.set(false);
  }
}
