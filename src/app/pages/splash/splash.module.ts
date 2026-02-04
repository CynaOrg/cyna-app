import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SplashPage } from './splash.page';
import { CynaLogoComponent } from '../../shared/components/cyna-logo/cyna-logo.component';

import { SplashPageRoutingModule } from './splash-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SplashPageRoutingModule,
    CynaLogoComponent,
  ],
  declarations: [SplashPage],
})
export class SplashPageModule {}
