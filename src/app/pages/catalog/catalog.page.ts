import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProductType } from '@core/interfaces/product.interface';
import { CatalogPageComponent } from '@shared/components/catalog-page/catalog-page.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

interface CatalogTab {
  type: ProductType;
  labelKey: string;
  titleKey: string;
  subtitleKey: string;
  routePrefix: string;
}

@Component({
  host: { class: 'ion-page' },
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    CatalogPageComponent,
    MobileHeaderComponent,
    NavbarComponent,
  ],
  styles: [
    `
      /* Cyna primary border style for the catalog ion-segment.
         Removes Ionic default grey background + active white pill,
         keeps the indicator as a 2px primary underline under the
         active tab. Scoped to <ion-segment class="catalog-segment">. */
      ion-segment.catalog-segment {
        --background: transparent;
      }
      ion-segment.catalog-segment ion-segment-button {
        --background: transparent;
        --background-checked: transparent;
        --background-hover: transparent;
        --background-focused: transparent;
        --color: var(--color-text-muted, #9ca3af);
        --color-checked: var(--color-primary, #4f39f6);
        --indicator-color: var(--color-primary, #4f39f6);
        --indicator-height: 2px;
        --border-radius: 0;
        --padding-top: 8px;
        --padding-bottom: 8px;
        min-height: 44px;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0;
      }
      ion-segment.catalog-segment
        ion-segment-button::part(indicator-background) {
        background: var(--color-primary, #4f39f6);
        height: 2px;
      }
    `,
  ],
  template: `
    <app-mobile-header
      title="CATALOG.TITLE"
      [showCart]="true"
      [showSearch]="true"
      [scrolled]="scrolled()"
    />

    <ion-content
      [fullscreen]="true"
      [scrollEvents]="true"
      [style.--padding-top]="'calc(env(safe-area-inset-top) + 80px)'"
      (ionScroll)="onScroll($event)"
    >
      <ion-segment
        class="catalog-segment px-4 pt-4 pb-3"
        [value]="active()"
        (ionChange)="onSegmentChange($event)"
      >
        @for (tab of tabs; track tab.type) {
          <ion-segment-button [value]="tab.type">
            <ion-label>{{ tab.labelKey | translate }}</ion-label>
          </ion-segment-button>
        }
      </ion-segment>

      @for (tab of tabs; track tab.type) {
        @if (active() === tab.type) {
          <app-catalog-page
            [productType]="tab.type"
            [title]="tab.titleKey"
            [subtitle]="tab.subtitleKey"
            [hideHeader]="true"
            [compact]="true"
            [routePrefix]="tab.routePrefix"
          />
        }
      }
    </ion-content>
  `,
})
export class CatalogPage {
  readonly tabs: CatalogTab[] = [
    {
      type: 'physical',
      labelKey: 'CATALOG.TAB_PRODUCTS',
      titleKey: 'CATALOG.PRODUCTS_TITLE',
      subtitleKey: 'CATALOG.PRODUCTS_SUBTITLE',
      routePrefix: '/products',
    },
    {
      type: 'saas',
      labelKey: 'CATALOG.TAB_SERVICES',
      titleKey: 'CATALOG.SERVICES_TITLE',
      subtitleKey: 'CATALOG.SERVICES_SUBTITLE',
      routePrefix: '/services',
    },
    {
      type: 'license',
      labelKey: 'CATALOG.TAB_LICENSES',
      titleKey: 'CATALOG.LICENSES_TITLE',
      subtitleKey: 'CATALOG.LICENSES_SUBTITLE',
      routePrefix: '/licenses',
    },
  ];

  readonly active = signal<ProductType>('physical');
  readonly scrolled = signal<boolean>(false);

  onSegmentChange(event: Event): void {
    const value = (event as CustomEvent<{ value: string }>).detail.value;
    if (value === 'physical' || value === 'saas' || value === 'license') {
      this.active.set(value);
    }
  }

  onScroll(event: CustomEvent<{ scrollTop: number }>): void {
    const top = event.detail?.scrollTop ?? 0;
    const next = top > 50;
    if (next !== this.scrolled()) {
      this.scrolled.set(next);
    }
  }
}
