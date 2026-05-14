import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { MobilePageShellComponent } from './mobile-page-shell.component';
import { MobileHeaderService } from '@core/services/mobile-header.service';

describe('MobilePageShellComponent', () => {
  let fixture: ComponentFixture<MobilePageShellComponent>;
  let component: MobilePageShellComponent;
  let header: MobileHeaderService;
  let actionClick$: Subject<void>;

  beforeEach(async () => {
    actionClick$ = new Subject<void>();
    const headerSpy: Partial<MobileHeaderService> = {
      configure: jasmine.createSpy('configure'),
      setScrolled: jasmine.createSpy('setScrolled'),
      actionClick$: actionClick$.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [MobilePageShellComponent],
      providers: [{ provide: MobileHeaderService, useValue: headerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MobilePageShellComponent);
    component = fixture.componentInstance;
    header = TestBed.inject(MobileHeaderService);
    fixture.componentRef.setInput('title', 'My Page');
    fixture.detectChanges();
  });

  it('creates and configures the header on init', () => {
    expect(component).toBeTruthy();
    expect(header.configure).toHaveBeenCalled();
  });

  it('updates header.scrolled on scroll > 50', () => {
    component.onScroll(
      new CustomEvent('ionScroll', { detail: { scrollTop: 200 } }) as never,
    );
    expect(header.setScrolled).toHaveBeenCalledWith(true);
  });

  it('updates header.scrolled false at the top of the page', () => {
    component.onScroll(
      new CustomEvent('ionScroll', { detail: { scrollTop: 10 } }) as never,
    );
    expect(header.setScrolled).toHaveBeenCalledWith(false);
  });

  it('emits actionClick when the header bus fires', () => {
    let fired = false;
    component.actionClick.subscribe(() => (fired = true));
    actionClick$.next();
    expect(fired).toBeTrue();
  });

  it('refresh() reconfigures the header', () => {
    (header.configure as jasmine.Spy).calls.reset();
    component.refresh();
    expect(header.configure).toHaveBeenCalled();
  });
});
