import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SplashPage } from './splash.page';

import { SplashPageRoutingModule } from './splash-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SplashPageRoutingModule
  ],
  declarations: [SplashPage]
})
export class SplashPageModule {}
