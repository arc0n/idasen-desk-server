import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StorageService} from "./storage.service";
import {BaseResourceService} from "./base-resource.service";
import {IonicStorageModule} from "@ionic/storage-angular";


@NgModule({
  imports: [IonicStorageModule],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<any> {
    return {
      ngModule: SharedModule,
      providers: [StorageService, BaseResourceService]
    };
  }
}
