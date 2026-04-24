import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { EditableSectionComponent } from './editable-section.component';

@Component({
  standalone: true,
  imports: [EditableSectionComponent],
  template: `
    <app-editable-section
      titleKey="ACCOUNT.SECTIONS.PERSONAL_INFO"
      [canSave]="canSave"
      [saving]="saving"
      (save)="onSubmit()"
    >
      <ng-template #view>
        <span data-test="view">View mode</span>
      </ng-template>
      <ng-template #edit>
        <span data-test="edit">Edit mode</span>
      </ng-template>
    </app-editable-section>
  `,
})
class HostComponent {
  canSave = true;
  saving = false;
  submitted = 0;
  onSubmit() {
    this.submitted++;
  }
}

describe('EditableSectionComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function click(selector: string) {
    const btn = fixture.nativeElement.querySelector(selector) as HTMLElement;
    btn.click();
    fixture.detectChanges();
  }

  it('renders the view template by default', () => {
    expect(
      fixture.nativeElement.querySelector('[data-test="view"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="edit"]'),
    ).toBeFalsy();
  });

  it('shows the Modifier button in view mode', () => {
    expect(
      fixture.nativeElement.querySelector('[data-test="modify-btn"]'),
    ).toBeTruthy();
  });

  it('switches to edit template when Modifier is clicked', () => {
    click('[data-test="modify-btn"]');
    expect(
      fixture.nativeElement.querySelector('[data-test="edit"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="view"]'),
    ).toBeFalsy();
  });

  it('emits submit when Enregistrer is clicked', () => {
    click('[data-test="modify-btn"]');
    click('[data-test="save-btn"] button');
    expect(host.submitted).toBe(1);
  });

  it('reverts to view mode when Annuler is clicked', () => {
    click('[data-test="modify-btn"]');
    click('[data-test="cancel-btn"] button');
    expect(
      fixture.nativeElement.querySelector('[data-test="view"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="edit"]'),
    ).toBeFalsy();
  });

  it('disables Enregistrer when canSave is false', () => {
    host.canSave = false;
    fixture.detectChanges();
    click('[data-test="modify-btn"]');
    const btn = fixture.nativeElement.querySelector(
      '[data-test="save-btn"] button',
    ) as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('shows a spinner when saving is true', () => {
    click('[data-test="modify-btn"]');
    host.saving = true;
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test="spinner"]'),
    ).toBeTruthy();
  });
});
