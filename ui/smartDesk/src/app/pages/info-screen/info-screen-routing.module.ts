import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InfoScreenPage } from './info-screen-page.component';

const routes: Routes = [
  {
    path: '',
    component: InfoScreenPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoScreenPageRoutingModule {}
