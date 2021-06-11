import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ServerControllerPage } from './server-controller-page.component';
import { ExploreContainerComponentModule } from '../../common/explore-container/explore-container.module';

import { Tab3PageRoutingModule } from './server-controller-routing.module';
import {IonicStorageModule} from "@ionic/storage-angular";
import {SharedModule} from "../../services/shared.module";
import {DeskListComponent} from "./desk-list/desk-list.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ExploreContainerComponentModule,
        RouterModule.forChild([{path: '', component: ServerControllerPage}]),
        Tab3PageRoutingModule,
        ReactiveFormsModule,
      CommonModule
    ],
  declarations: [ServerControllerPage, DeskListComponent],
})
export class ServerControllerPageModule {}
