import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { NativeShellComponent } from './native-shell.component';
import { CartStore } from '@core/stores/cart.store';
import { AuthStore } from '@core/stores/auth.store';
import { SearchService } from '@core/services/search.service';
import { StatusBarService } from '../services/status-bar.service';
import { AppLifecycleService } from '../services/app-lifecycle.service';
import { NetworkService } from '../services/network.service';
import { DeepLinkService } from '../services/deep-link.service';

describe('NativeShellComponent', () => {
  let statusBar: jasmine.SpyObj<StatusBarService>;
  let lifecycle: jasmine.SpyObj<AppLifecycleService>;
  let network: jasmine.SpyObj<NetworkService>;
  let deepLink: jasmine.SpyObj<DeepLinkService>;

  beforeEach(async () => {
    statusBar = jasmine.createSpyObj<StatusBarService>('StatusBarService', [
      'init',
      'setLight',
      'setDark',
    ]);
    statusBar.init.and.resolveTo();
    lifecycle = jasmine.createSpyObj<AppLifecycleService>(
      'AppLifecycleService',
      ['init'],
    );
    lifecycle.init.and.resolveTo();
    network = jasmine.createSpyObj<NetworkService>('NetworkService', ['init']);
    network.init.and.resolveTo();
    deepLink = jasmine.createSpyObj<DeepLinkService>('DeepLinkService', [
      'init',
    ]);
    deepLink.init.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [NativeShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: CartStore,
          useValue: { count$: new BehaviorSubject<number>(0) },
        },
        {
          provide: AuthStore,
          useValue: { isAuthenticated$: new BehaviorSubject<boolean>(false) },
        },
        {
          provide: SearchService,
          useValue: jasmine.createSpyObj('SearchService', ['open']),
        },
        { provide: StatusBarService, useValue: statusBar },
        { provide: AppLifecycleService, useValue: lifecycle },
        { provide: NetworkService, useValue: network },
        { provide: DeepLinkService, useValue: deepLink },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('creates the native shell', () => {
    const fixture = TestBed.createComponent(NativeShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header, content and bottom nav layout', () => {
    const fixture = TestBed.createComponent(NativeShellComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('ion-app')).toBeTruthy();
    expect(el.querySelector('app-native-mobile-header')).toBeTruthy();
    expect(el.querySelector('ion-content')).toBeTruthy();
    expect(el.querySelector('app-native-bottom-nav')).toBeTruthy();
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });

  it('initialises every native service on mount', async () => {
    const fixture = TestBed.createComponent(NativeShellComponent);
    fixture.detectChanges();
    await fixture.componentInstance.ngOnInit();
    expect(statusBar.init).toHaveBeenCalled();
    expect(lifecycle.init).toHaveBeenCalled();
    expect(network.init).toHaveBeenCalled();
    expect(deepLink.init).toHaveBeenCalled();
  });

  it('keeps rendering even when one of the native services rejects', async () => {
    statusBar.init.and.rejectWith(new Error('plugin missing'));
    const fixture = TestBed.createComponent(NativeShellComponent);
    fixture.detectChanges();
    await expectAsync(fixture.componentInstance.ngOnInit()).toBeResolved();
    expect(fixture.nativeElement.querySelector('ion-app')).toBeTruthy();
  });
});
