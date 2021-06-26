import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoScreenPage } from './info-screen-page.component';
import { ExploreContainerComponentModule } from '../../common/explore-container/explore-container.module';

import { InfoScreenPageRoutingModule } from './info-screen-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    InfoScreenPageRoutingModule
  ],
  declarations: [InfoScreenPage],
})
export class InfoScreenPageModule {}
