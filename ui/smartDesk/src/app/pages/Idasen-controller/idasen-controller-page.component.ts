import { Component } from '@angular/core';
import { BaseResourceService } from '../../services/base-resource.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-idasen-controller',
  templateUrl: 'idasen-controller-page.component.html',
  styleUrls: ['idasen-controller-page.component.scss'],
})
export class IdasenControllerPage {
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
    const obs = this.service.connectDesk();
    obs.subscribe((val) => {
      this.status = val;
    });
  }
}
