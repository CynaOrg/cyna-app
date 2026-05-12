import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionConfirmationPage } from './subscription-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionConfirmationPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionConfirmationRoutingModule {}
