import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardSidebarComponent } from '@shared/components/dashboard-sidebar/dashboard-sidebar.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ animated: false }),
    AppRoutingModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
    }),
    DashboardSidebarComponent,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ...provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => () => {
        // Configure i18n: use saved preference, then browser language, fallback to French
        translate.addLangs(['fr', 'en']);
        translate.setDefaultLang('fr');
        const savedLang = document.cookie
          .split('; ')
          .find((c) => c.startsWith('cyna_lang='))
          ?.split('=')[1];
        const browserLang = translate.getBrowserLang();
        const lang = savedLang?.match(/^(fr|en)$/)
          ? savedLang
          : browserLang?.match(/^(fr|en)$/)
            ? browserLang
            : 'fr';
        // Await translation loading to prevent flash of untranslated keys
        return firstValueFrom(translate.use(lang));
      },
      deps: [TranslateService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
