import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FaqComponent, FaqTab } from './faq.component';

const tabs: FaqTab[] = [
  {
    label: 'TAB.A',
    items: [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ],
  },
  {
    label: 'TAB.B',
    items: [{ question: 'Q3', answer: 'A3' }],
  },
];

describe('FaqComponent', () => {
  let fixture: ComponentFixture<FaqComponent>;
  let component: FaqComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tabs', tabs);
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('renders a button per tab', () => {
    const tabButtons = fixture.debugElement.queryAll(
      By.css('.flex.justify-center button'),
    );
    expect(tabButtons.length).toBe(2);
  });

  it('renders items of the active tab only', () => {
    const itemButtons = fixture.debugElement.queryAll(
      By.css('.flex.flex-col.gap-3 button'),
    );
    expect(itemButtons.length).toBe(2);
  });

  it('selectTab switches active tab and resets openIndex', () => {
    component.openIndex = 0;
    component.selectTab(1);
    expect(component.activeTab).toBe(1);
    expect(component.openIndex).toBeNull();
    fixture.detectChanges();
    const itemButtons = fixture.debugElement.queryAll(
      By.css('.flex.flex-col.gap-3 button'),
    );
    expect(itemButtons.length).toBe(1);
  });

  it('toggleItem opens and closes the same row', () => {
    component.toggleItem(0);
    expect(component.openIndex).toBe(0);
    component.toggleItem(0);
    expect(component.openIndex).toBeNull();
  });

  it('toggleItem switches from one row to another', () => {
    component.toggleItem(0);
    component.toggleItem(1);
    expect(component.openIndex).toBe(1);
  });

  it('renders nothing when tabs is empty', async () => {
    fixture.componentRef.setInput('tabs', []);
    fixture.detectChanges();
    const wrapper = fixture.debugElement.query(By.css('.w-full.max-w-3xl'));
    expect(wrapper).toBeNull();
  });
});
