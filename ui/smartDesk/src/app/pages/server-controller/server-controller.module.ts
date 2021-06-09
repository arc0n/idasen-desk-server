import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ServerControllerPage } from './server-controller-page.component';
import { ExploreContainerComponentModule } from '../../common/explore-container/explore-container.module';

import { Tab3PageRoutingModule } from './server-controller-routing.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ExploreContainerComponentModule,
        RouterModule.forChild([{path: '', component: ServerControllerPage}]),
        Tab3PageRoutingModule,
        ReactiveFormsModule,
    ],
  declarations: [ServerControllerPage],
})
export class ServerControllerPageModule {}
