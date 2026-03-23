import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MentionsPage } from './mentions.page';
import { CguPage } from './cgu.page';
import { PrivacyPage } from './privacy.page';

const routes: Routes = [
  {
    path: 'mentions',
    component: MentionsPage,
  },
  {
    path: 'cgu',
    component: CguPage,
  },
  {
    path: 'privacy',
    component: PrivacyPage,
  },
  {
    path: '',
    redirectTo: 'mentions',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LegalRoutingModule {}
