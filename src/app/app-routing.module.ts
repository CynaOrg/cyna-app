import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import {
  nativeOnlyGuard,
  browserOnlyGuard,
} from '@core/guards/platform-redirect.guard';

const isNative = isNativeCapacitor();

const routes: Routes = [
  {
    path: 'splash',
    loadChildren: () =>
      import('./pages/splash/splash.module').then((m) => m.SplashPageModule),
  },
  {
    path: 'landing',
    canActivate: [browserOnlyGuard],
    loadChildren: () =>
      import('./pages/landing/landing.module').then((m) => m.LandingPageModule),
  },
  {
    path: 'home',
    canActivate: [nativeOnlyGuard],
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: isNative ? 'splash' : 'landing',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: isNative ? 'home' : 'landing',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
