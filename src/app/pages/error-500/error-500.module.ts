import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Error500Page } from './error-500.page';
import { Error500PageRoutingModule } from './error-500-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    Error500PageRoutingModule,
    BrowserHeaderComponent,
    TranslateModule,
  ],
  declarations: [Error500Page],
})
export class Error500PageModule {}
