import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NATIVE_ROUTES } from './native.routes';

/**
 * Lazy-loaded module that owns the `/m/*` route tree.
 *
 * Loaded from the root router only when the user navigates to `/m`, which
 * keeps native code out of the web bundle entry chunk. The web app never
 * imports this module directly.
 */
@NgModule({
  imports: [RouterModule.forChild(NATIVE_ROUTES)],
  exports: [RouterModule],
})
export class NativeRoutesModule {}
