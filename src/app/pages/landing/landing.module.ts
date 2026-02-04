import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LandingPage } from './landing.page';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';

import { LandingPageRoutingModule } from './landing-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LandingPageRoutingModule,
    BrowserHeaderComponent,
  ],
  declarations: [LandingPage],
})
export class LandingPageModule {}
