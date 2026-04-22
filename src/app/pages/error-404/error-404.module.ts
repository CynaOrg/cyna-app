import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Error404Page } from './error-404.page';
import { Error404PageRoutingModule } from './error-404-routing.module';
import { BrowserHeaderComponent } from '@shared/components/browser-header/browser-header.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    Error404PageRoutingModule,
    BrowserHeaderComponent,
    TranslateModule,
  ],
  declarations: [Error404Page],
})
export class Error404PageModule {}
