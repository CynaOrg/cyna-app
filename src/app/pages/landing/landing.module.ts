import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LandingPage } from './landing.page';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';
import { HeroComponent } from '@shared/components/hero/hero.component';
import { TrustedByComponent } from '@shared/components/trusted-by/trusted-by.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ProductListComponent } from '@shared/components/product-list/product-list.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { FaqComponent } from '@shared/components/faq/faq.component';

import { LandingPageRoutingModule } from './landing-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LandingPageRoutingModule,
    BrowserHeaderComponent,
    HeroComponent,
    TrustedByComponent,
    SectionHeaderComponent,
    ProductListComponent,
    FooterComponent,
    FaqComponent,
    TranslateModule,
  ],
  declarations: [LandingPage],
})
export class LandingPageModule {}
