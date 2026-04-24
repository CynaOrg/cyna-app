import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserResponse } from '@core/interfaces/auth.interface';
import { DisplayRowComponent } from '../../shared/display-row.component';
import { EditableSectionComponent } from '../../shared/editable-section.component';

@Component({
  selector: 'app-account-tab',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    DisplayRowComponent,
    EditableSectionComponent,
  ],
  templateUrl: './account-tab.component.html',
})
export class AccountTabComponent implements OnInit {
  @Input() set user(value: UserResponse | null) {
    if (value) {
      this.currentUser = value;
      this.syncForms(value);
    }
  }
  @Input() error: string | null = null;

  @Output() profileSubmit = new EventEmitter<{
    firstName: string;
    lastName: string;
    companyName: string;
    vatNumber: string;
  }>();

  currentUser: UserResponse | null = null;

  personalForm!: FormGroup;
  companyForm!: FormGroup;

  personalSaving = signal(false);
  companySaving = signal(false);
  personalError = signal<string | null>(null);
  companyError = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
    });
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.maxLength(255)]],
      vatNumber: ['', [Validators.maxLength(50)]],
    });
    if (this.currentUser) {
      this.syncForms(this.currentUser);
    }
  }

  private syncForms(user: UserResponse): void {
    if (this.personalForm) {
      this.personalForm.patchValue({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      });
    }
    if (this.companyForm) {
      this.companyForm.patchValue({
        companyName: user.companyName ?? '',
        vatNumber: user.vatNumber ?? '',
      });
    }
  }

  submitPersonal(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }
    this.personalSaving.set(true);
    this.personalError.set(null);

    this.profileSubmit.emit({
      firstName: this.personalForm.value.firstName,
      lastName: this.personalForm.value.lastName,
      companyName: this.currentUser?.companyName ?? '',
      vatNumber: this.currentUser?.vatNumber ?? '',
    });
    this.personalSaving.set(false);
  }

  submitCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    this.companySaving.set(true);
    this.companyError.set(null);

    this.profileSubmit.emit({
      firstName: this.currentUser?.firstName ?? '',
      lastName: this.currentUser?.lastName ?? '',
      companyName: this.companyForm.value.companyName,
      vatNumber: this.companyForm.value.vatNumber,
    });
    this.companySaving.set(false);
  }

  cancelPersonal(): void {
    if (this.currentUser) this.syncForms(this.currentUser);
    this.personalError.set(null);
  }

  cancelCompany(): void {
    if (this.currentUser) this.syncForms(this.currentUser);
    this.companyError.set(null);
  }
}
