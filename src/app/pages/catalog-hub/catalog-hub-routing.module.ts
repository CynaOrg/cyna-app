import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogHubPage } from './catalog-hub.page';

const routes: Routes = [
  {
    path: '',
    component: CatalogHubPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogHubPageRoutingModule {}
