import { Component } from '@angular/core';
import {BaseResourceService} from "../../services/base-resource.service";

@Component({
  selector: 'app-server-controller',
  templateUrl: 'server-controller-page.component.html',
  styleUrls: ['server-controller-page.component.scss'],
})
export class ServerControllerPage {
  constructor(private service: BaseResourceService) {}
  status: string;

  /** @internal */
  connectToDesk() {
    const obs = this.service.connectDesk();
    obs.subscribe((val) => {
      console.log('value received: ', val);
    });
  }

  /** @internal */
  getDeskStatus() {
    const obs = this.service.getStatus();
    obs.subscribe((val) => {
      this.status = val
    });
  }}
