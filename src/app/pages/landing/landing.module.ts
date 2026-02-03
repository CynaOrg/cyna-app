import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LandingPage } from './landing.page';
import { NavbarComponent } from '@shared/index';

import { LandingPageRoutingModule } from './landing-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LandingPageRoutingModule,
    NavbarComponent,
  ],
  declarations: [LandingPage],
})
export class LandingPageModule {}
