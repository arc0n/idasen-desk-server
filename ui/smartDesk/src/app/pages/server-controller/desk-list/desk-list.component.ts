import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Desk } from '../../../models/desk';
import { BaseResourceService } from '../../../services/base-resource.service';
import { of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
const CONNECTION_ERROR = 'error-string';

@Component({
  selector: 'modal-search-desk',
  templateUrl: './desk-list.component.html',
  styleUrls: ['./desk-list.component.scss'],
})
export class DeskListComponent implements OnInit, OnDestroy {
  @ViewChild('contentPage') contentPage: ElementRef;

  deskList: Desk[] = [];
  private searchSubscription: Subscription;
  /** @internal */
  isLoading = false;

  constructor(
    private modalController: ModalController,
    private service: BaseResourceService,
    private toastController: ToastController /*
    private gestureCtrl: GestureController
*/
  ) {}

  ngOnInit() {
    this.searchForDesks();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.dismissToast();
  }

  searchForDesks() {
    this.dismissToast();
    this.isLoading = true;
    this.searchSubscription = this.service
      .searchForDesk()
      .pipe(
        catchError(() => {
          this.presentToastWithOptions();
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((data) => {
        this.isLoading = false;
        this.deskList = data;
      });
  }

  dismissModal() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  dismissToast() {
    this.toastController.dismiss(CONNECTION_ERROR).catch(() => {
      /* dont care */
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

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      id: CONNECTION_ERROR,
      message: 'Connection to server not possible, try again?',
      color: 'danger',
      position: 'middle',
      buttons: [
        {
          icon: 'refresh',
          role: 'cancel',
          handler: () => {
            this.searchForDesks();
          },
        },
      ],
    });
    await toast.present();
  }

  deskClicked(desk: Desk) {
    this.service
      .setDeskAddress(desk.deskAddress)
      .then(() => this.presentToast('new Desk configured', 'primary'));
    setTimeout(() => {
      this.dismissModal();
    }, 1500);
  }
}
