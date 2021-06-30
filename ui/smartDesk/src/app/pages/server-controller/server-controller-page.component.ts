import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseResourceService } from '../../services/base-resource.service';
import { FormControl, FormGroup } from '@angular/forms';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { ModalController, ToastController } from '@ionic/angular';
import { DeskListComponent } from './desk-list/desk-list.component';
import { WebSocketService } from '../../services/webSocketService';

@Component({
  selector: 'app-server-controller',
  templateUrl: 'server-controller-page.component.html',
  styleUrls: ['server-controller-page.component.scss'],
})
export class ServerControllerPage implements OnInit, OnDestroy {
  constructor(
    private baseResourceService: BaseResourceService,
    private toastController: ToastController,
    private modalController: ModalController,
    private webSocket: WebSocketService
  ) {}

  /** @internal */
  triggerConnectionTest$ = new Subject<void>();

  /** @internal */
  testSuccessful = null;

  /** @internal */
  disableButtons = false;

  /*** @internal */
  isConnected = false;
  /*** @internal */
  status: string;
  /*** @internal */
  isLoading: boolean;
  /*** @internal */
  color: any;

  subscription: Subscription[] = [];

  /**
   * @internal
   */
  serverForm = new FormGroup({
    serverIpControl: new FormControl(''),
    serverPortControl: new FormControl(null),
    pcIpControl: new FormControl(''),
    pcPortControl: new FormControl(null),
  });

  ngOnInit(): void {
    this.baseResourceService
      .getStoredColor()
      .subscribe((color) => (this.color = color));

    this.subscription.push(
      this.triggerConnectionTest$
        .pipe(
          switchMap(() => {
            this.testSuccessful = null;
            return this.baseResourceService.checkConnection();
          })
        )
        .subscribe((val) => {
          this.testSuccessful = val;
          this.baseResourceService
            .getStoredConnectionData()
            .subscribe((data: { ip: string; port: number }) => {
              this.webSocket.connect(`ws://${data?.ip}:${8080}`);
              // TODO what when error?
            });
        })
    );

    this.subscription.push(
      this.serverForm.valueChanges
        .pipe(debounceTime(500))
        .subscribe((rawVal) => {
          this.baseResourceService
            .setServerIp(
              rawVal.serverIpControl,
              rawVal.serverPortControl,
              rawVal.pcIpControl,
              rawVal.pcPortControl
            )
            .then(() => this.triggerConnectionTest$.next());
        })
    );

    this.baseResourceService
      .getStoredConnectionData()
      .pipe(tap(() => (this.isLoading = true)))
      .subscribe((values) => {
        this.triggerConnectionTest$.next();
        this.isLoading = false;
        this.serverForm.patchValue({
          serverIpControl: values.ip || null,
          serverPortControl: values.port || 3000,
          pcIpControl: values.pcip || null,
          pcPortControl: values.pcport || 8085,
        });
      });
  }

  /** @internal */
  async presentModal() {
    const modal = await this.modalController.create({
      component: DeskListComponent,
      cssClass: 'modal-search-desk',
    });
    return await modal.present();
  }

  ngOnDestroy(): void {
    this.subscription.forEach((s) => s.unsubscribe());
  }

  /** @internal */
  connectToDesk() {
    this.disableButtons = true;
    const obs = this.isConnected
      ? this.baseResourceService.disconnectDesk()
      : this.baseResourceService.connectDesk();
    obs
      .pipe(
        catchError((e) => {
          return of({ error: 'No connection to server' });
        })
      )
      .subscribe((result) => {
        this.disableButtons = false;
        if (!('boolean' === typeof result) && result.error) {
          this.presentToast(result.error, 'danger');
          return;
        }
        if (!result) {
          this.presentToast('No connection to Desk', 'danger');
          return;
        }
        this.isConnected = !this.isConnected;
        if (this.isConnected) this.presentToast('Desk connected', 'primary');
      });
  }

  /** @internal */
  getDeskStatus() {
    const obs = this.baseResourceService.getStatus();
    obs.subscribe((val) => {
      this.status = val;
    });
  }

  private async presentToast(msg: string, level: 'primary' | 'danger') {
    const toast = await this.toastController.create({
      position: 'top',
      message: msg,
      color: level,
      duration: 2000,
    });
    toast.present();
  }

  setColor(event: any) {
    this.baseResourceService.setInfoscreenColor(event);
  }
}
