import {
  Component,
  EventEmitter,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-privacy-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIconComponent],
  templateUrl: './privacy-tab.component.html',
})
export class PrivacyTabComponent {
  @Output() deleteAccount = new EventEmitter<string>();

  showDeleteConfirm = signal(false);
  deletePassword = signal('');
  deleteError = signal<string | null>(null);
  deleteLoading = signal(false);

  showDeleteConfirmation(): void {
    this.showDeleteConfirm.set(true);
    this.deletePassword.set('');
    this.deleteError.set(null);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletePassword.set('');
    this.deleteError.set(null);
  }

  onDeletePasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.deletePassword.set(input.value);
  }

  onDeleteAccount(): void {
    if (!this.deletePassword()) return;

    this.deleteError.set(null);
    this.deleteLoading.set(true);

    this.deleteAccount.emit(this.deletePassword());
  }

  onDeleteSuccess(): void {
    this.deleteLoading.set(false);
  }

  onDeleteError(error: string): void {
    this.deleteError.set(error);
    this.deleteLoading.set(false);
  }
}