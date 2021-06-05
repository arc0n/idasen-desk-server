import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'info-screen',
        loadChildren: () =>
          import('../pages/info-screen/info-screen.module').then(
            (m) => m.InfoScreenPageModule
          ),
      },
      {
        path: 'idasen-controller',
        loadChildren: () =>
          import('../pages/Idasen-controller/idasen-controller.module').then(
            (m) => m.IdasenControllerPageModule
          ),
      },
      {
        path: 'server-controller',
        loadChildren: () =>
          import('../pages/server-controller/server-controller.module').then(
            (m) => m.ServerControllerPageModule
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/info-screen',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/info-screen',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
