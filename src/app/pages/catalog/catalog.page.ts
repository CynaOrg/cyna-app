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
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar
        [style.--padding-top]="0"
        [style.--padding-bottom]="0"
        [style.--padding-start]="0"
        [style.--padding-end]="0"
        [style.--min-height]="0"
      >
        <app-mobile-header />
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="px-4 pt-3 pb-2">
        <h1 class="text-2xl font-bold text-text-primary tracking-tight">
          {{ 'CATALOG.TITLE' | translate }}
        </h1>
      </div>

      <ion-segment
        class="px-4 pb-3"
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
            [hideHeader]="false"
            [compact]="true"
            [routePrefix]="tab.routePrefix"
          />
        }
      }
    </ion-content>

    <ion-footer class="ion-no-border">
      <app-navbar />
    </ion-footer>
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

  onSegmentChange(event: Event): void {
    const value = (event as CustomEvent<{ value: string }>).detail.value;
    if (value === 'physical' || value === 'saas' || value === 'license') {
      this.active.set(value);
    }
  }
}
