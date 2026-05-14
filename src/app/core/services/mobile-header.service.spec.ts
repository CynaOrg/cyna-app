import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MobileHeaderService } from './mobile-header.service';

describe('MobileHeaderService', () => {
  let service: MobileHeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileHeaderService);
  });

  it('creates with default state', () => {
    expect(service.showBack()).toBeFalse();
    expect(service.title()).toBe('');
    expect(service.actionLabel()).toBe('Action');
    expect(service.visible()).toBeFalse();
  });

  it('configure() applies a full config', () => {
    service.configure({
      showBack: true,
      title: 'My Page',
      showSearch: true,
      showCart: true,
      actionIcon: 'icon',
      actionLabel: 'Save',
      actionDisabled: true,
      visible: true,
    });
    expect(service.showBack()).toBeTrue();
    expect(service.title()).toBe('My Page');
    expect(service.showSearch()).toBeTrue();
    expect(service.showCart()).toBeTrue();
    expect(service.actionIcon()).toBe('icon');
    expect(service.actionLabel()).toBe('Save');
    expect(service.actionDisabled()).toBeTrue();
    expect(service.visible()).toBeTrue();
    expect(service.scrolled()).toBeFalse();
  });

  it('configure() falls back to defaults for missing fields', () => {
    service.configure({});
    expect(service.title()).toBe('');
    expect(service.visible()).toBeTrue();
    expect(service.actionLabel()).toBe('Action');
  });

  it('setActionDisabled() flips the flag', () => {
    service.setActionDisabled(true);
    expect(service.actionDisabled()).toBeTrue();
  });

  it('setScrolled() flips the flag', () => {
    service.setScrolled(true);
    expect(service.scrolled()).toBeTrue();
  });

  it('hide() sets visible=false', () => {
    service.configure({ visible: true });
    service.hide();
    expect(service.visible()).toBeFalse();
  });

  it('emitActionClick() pushes a value through actionClick$', async () => {
    const seen = firstValueFrom(service.actionClick$);
    service.emitActionClick();
    await seen;
    expect(true).toBeTrue();
  });
});
