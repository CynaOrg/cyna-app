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

@Component({
  selector: 'app-editable-section',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isEditing = signal(false);

  enterEdit(): void {
    this.isEditing.set(true);
  }

  onCancel(): void {
    this.isEditing.set(false);
    this.cancel.emit();
  }

  onSubmit(): void {
    if (!this.canSave || this.saving) return;
    this.submit.emit();
  }

  exitEdit(): void {
    this.isEditing.set(false);
  }
}
