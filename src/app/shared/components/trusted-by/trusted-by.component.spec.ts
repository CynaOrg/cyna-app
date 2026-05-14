import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { TrustedByComponent } from './trusted-by.component';

describe('TrustedByComponent', () => {
  let fixture: ComponentFixture<TrustedByComponent>;
  let component: TrustedByComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustedByComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(TrustedByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('renders four stat blocks', () => {
    const blocks = fixture.debugElement.queryAll(
      By.css('.flex.flex-col.items-center'),
    );
    expect(blocks.length).toBe(4);
  });

  it('renders an svg illustration per stat', () => {
    const svgs = fixture.debugElement.queryAll(By.css('svg'));
    expect(svgs.length).toBe(4);
  });
});
