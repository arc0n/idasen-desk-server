import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServerControllerPage } from './server-controller-page.component';

const routes: Routes = [
  {
    path: '',
    component: ServerControllerPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab3PageRoutingModule {}
