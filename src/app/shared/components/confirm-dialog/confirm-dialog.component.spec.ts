import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'TITLE');
    fixture.componentRef.setInput('message', 'MSG');
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('creates and renders inside body', () => {
    expect(component).toBeTruthy();
  });

  it('renders title and message', () => {
    const h2 = document.querySelector('#confirm-dialog-title');
    expect(h2?.textContent).toContain('TITLE');
    const p = document.querySelector('#confirm-dialog-title + p');
    expect(p?.textContent).toContain('MSG');
  });

  it('emits cancelled when escape is pressed', () => {
    spyOn(component.cancelled, 'emit');
    component.onEscape();
    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('emits confirmed when onConfirm() is called', () => {
    spyOn(component.confirmed, 'emit');
    component.onConfirm();
    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('emits cancelled when onCancel() is called', () => {
    spyOn(component.cancelled, 'emit');
    component.onCancel();
    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('locks body overflow on init and restores it on destroy', () => {
    // ngAfterViewInit ran during beforeEach detectChanges(); overflow is locked.
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    // restored after destroy
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
