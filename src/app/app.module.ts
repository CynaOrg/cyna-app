import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AuthStore } from './core/stores/auth.store';
import { LanguageStorageService } from '@core/services/language-storage.service';
import { isNativeCapacitor } from '@core/utils/platform.utils';

registerLocaleData(localeFr);
registerLocaleData(localeEn);

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardSidebarComponent } from '@shared/components/dashboard-sidebar/dashboard-sidebar.component';
import { SearchModalComponent } from '@shared/components/search-modal/search-modal.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ animated: isNativeCapacitor() }),
    AppRoutingModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
    }),
    DashboardSidebarComponent,
    SearchModalComponent,
    NavbarComponent,
    MobileHeaderComponent,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: LOCALE_ID,
      useFactory: () => {
        const saved = document.cookie
          .split('; ')
          .find((c) => c.startsWith('cyna_lang='))
          ?.split('=')[1];
        return saved === 'en' ? 'en' : 'fr';
      },
    },
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ...provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory:
        (translate: TranslateService, langStorage: LanguageStorageService) =>
        async () => {
          // Configure i18n: use saved preference, then browser language,
          // fallback to French. On native the saved preference comes from
          // @capacitor/preferences (cookies don't reliably persist across
          // app launches on capacitor:// origin).
          translate.addLangs(['fr', 'en']);
          translate.setDefaultLang('fr');
          const saved = await langStorage.load();
          const browserLang = translate.getBrowserLang();
          const lang = saved
            ? saved
            : browserLang?.match(/^(fr|en)$/)
              ? browserLang
              : 'fr';
          // Await translation loading to prevent flash of untranslated keys
          await firstValueFrom(translate.use(lang));
        },
      deps: [TranslateService, LanguageStorageService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (authStore: AuthStore) => () =>
        firstValueFrom(authStore.tryRestoreSession()),
      deps: [AuthStore],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
