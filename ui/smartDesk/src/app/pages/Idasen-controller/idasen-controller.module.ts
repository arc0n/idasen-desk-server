import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdasenControllerPage } from './idasen-controller-page.component';
import { ExploreContainerComponentModule } from '../../common/explore-container/explore-container.module';

import { IdasenControllerPageRoutingModule } from './idasen-controller-routing.module';
import {SharedModule} from "../../services/shared.module";
import {IonicStorageModule} from "@ionic/storage-angular";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    IdasenControllerPageRoutingModule,

  ],
  declarations: [IdasenControllerPage],
})
export class IdasenControllerPageModule {}
