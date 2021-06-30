import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BaseResourceService } from '../../services/base-resource.service';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
import { AnimationController, IonRange, ToastController } from '@ionic/angular';
import { WebSocketService } from '../../services/webSocketService';
import { MemoryPositions } from '../../models/desk';

@Component({
  selector: 'app-idasen-controller',
  templateUrl: 'idasen-controller-page.component.html',
  styleUrls: ['idasen-controller-page.component.scss'],
})
export class IdasenControllerPage implements OnInit, OnDestroy {
  @ViewChild('deskPicture', { static: false }) deskPicture: any;
  triggerMoveDeskApiCall$ = new Subject<number>();
  interval: any;
  sliderValue: number;
  positions: MemoryPositions;

  constructor(
    private resourcesService: BaseResourceService,
    private animationCtrl: AnimationController,
    private webSocket: WebSocketService,
    private toastController: ToastController
  ) {}

  /**
   * @internal
   */
  memoryEnabled = false;

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.resourcesService
      .getMemoryPositions()
      .pipe(
        catchError((err) => {
          console.log(err);
          return null;
        })
      )
      .subscribe((pos: MemoryPositions) => {
        if (!pos) return;
        this.positions = pos;
      });

    this.resourcesService
      .getStoredConnectionData()
      .subscribe((data: { ip: string; port: number }) => {
        this.webSocket.connect(`ws://${data?.ip}:${8080}`);
        // TODO what when error?
      });
    this.subscriptions.push(
      this.webSocket.messages$.subscribe((height: number) => {
        if (height !== this.sliderValue) {
          this.performAnimation(height, this.sliderValue);
          this.sliderValue = height;
        }
      })
    );

    this.subscriptions.push(
      this.triggerMoveDeskApiCall$
        .pipe(
          debounceTime(1000),
          switchMap((value: number) => {
            return this.resourcesService.moveDesk(value).pipe(
              catchError((err) => {
                this.presentToast('No Connection to server', 'danger');
                return of(err);
              })
            );
          })
        )
        .subscribe((val) => {
          if (val === false) {
            this.presentToast('Please connect desk first', 'danger');
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  performAnimation(newValue, oldValue = 0) {
    console.log(newValue, oldValue);
    let offset = 0;
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      offset++;

      if (offset === Math.abs(oldValue - newValue)) {
        clearInterval(this.interval);
        return;
      }
      this.animationCtrl
        .create()
        .addElement(this.deskPicture?.nativeElement)
        .duration(Math.abs(oldValue - newValue) * 1000 + 500)
        .iterations(1)
        .keyframes([
          //   {offset: 0, transform: 'translateY(0px)'},
          {
            offset: 1,
            transform: `translateY(-${
              (oldValue > newValue ? oldValue - offset : oldValue + offset) /
              1.5
            }%)`,
          },
        ])
        .play();
    }, 20);
  }

  heightSliderClicked(event) {
    this.triggerMoveDeskApiCall$.next(event.target.value);
  }

  writeNewPositions(pos: MemoryPositions) {
    this.resourcesService
      .putMemoryPositions(pos)
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        if (!result) {
          this.presentToast('Error while saving position', 'danger');
          return;
        }
        this.presentToast('Memory position saved', 'primary');
      });
  }

  private async presentToast(
    msg: string,
    level: 'primary' | 'danger' | 'success'
  ) {
    const toast = await this.toastController.create({
      position: 'top',
      message: msg,
      color: level,
      duration: 2000,
    });
    toast.present();
  }

  memoryButtonClicked(index: 'position1' | 'position2' | 'position3') {
    if (this.memoryEnabled) {
      this.memoryEnabled = false;
      this.positions[index] = this.sliderValue;
      this.resourcesService
        .putMemoryPositions(this.positions)
        .pipe(
          catchError((err) => {
            console.log(err);
            this.presentToast('Error on saving memory position', 'danger');
            return of();
          })
        )
        .subscribe(() => {
          this.presentToast('memory position saved', 'success');
        });
    } else {
      this.moveTo(this.positions[index]);
    }
  }

  moveTo(position: number) {
    if (!position) return;

    this.triggerMoveDeskApiCall$.next(position);
  }
}
