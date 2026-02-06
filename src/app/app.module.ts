import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthStore } from './core/stores/auth.store';

function initAuth(authStore: AuthStore): () => Promise<void> {
  return () => lastValueFrom(authStore.tryRestoreSession()).then(() => {});
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ animated: false }),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthStore],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
