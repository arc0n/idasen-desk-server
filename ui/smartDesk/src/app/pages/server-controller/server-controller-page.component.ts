import {Component, OnInit} from '@angular/core';
import {BaseResourceService} from "../../services/base-resource.service";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-server-controller',
  templateUrl: 'server-controller-page.component.html',
  styleUrls: ['server-controller-page.component.scss'],
})
export class ServerControllerPage implements OnInit{
  constructor(private baseResourceService: BaseResourceService) {}
  status: string;

  /**
   * @internal
   */
  serverForm = new FormGroup({
    // TODO read from local storage
    serverIpControl: new FormControl(''),
    serverPortControl: new FormControl(3000) })

  /** @internal */
  connectToDesk() {
    const obs = this.baseResourceService.connectDesk();
    obs.subscribe((val) => {
      console.log('value received: ', val);
    });
  }

  /** @internal */
  getDeskStatus() {
    const obs = this.baseResourceService.getStatus();
    obs.subscribe((val) => {
      this.status = val
    });
  }

  ngOnInit(): void {
    this.serverForm.valueChanges.subscribe((rawVal) => {
      this.baseResourceService.setServerIp(rawVal.serverIpControl, rawVal.serverPortControl)
    })
  }
}
