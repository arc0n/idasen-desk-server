import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BaseResourceService } from '../../services/base-resource.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { AnimationController, IonRange } from '@ionic/angular';
import { WebSocketService } from '../../services/webSocketService';

@Component({
  selector: 'app-idasen-controller',
  templateUrl: 'idasen-controller-page.component.html',
  styleUrls: ['idasen-controller-page.component.scss'],
})
export class IdasenControllerPage implements OnInit, OnDestroy {
  @ViewChild('deskPicture', { static: false }) deskPicture: any;
  triggerApiCall$ = new Subject<number>();
  interval: any;
  sliderValue: number;

  constructor(
    private resourcesService: BaseResourceService,
    private animationCtrl: AnimationController,
    private webSocket: WebSocketService
  ) {}

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.webSocket.connect();
    this.subscriptions.push(
      this.triggerApiCall$
        .pipe(
          debounceTime(1000),
          switchMap((value: number) => {
            return this.resourcesService.moveDesk(value);
          })
        )
        .subscribe((val) => {
          // TODO return some value to see if it has moved
        })
    );

    this.subscriptions.push(
      this.webSocket.messages$.subscribe((height: number) => {
        if (height !== this.sliderValue) {
          this.performAnimation(height, this.sliderValue);
          this.sliderValue = height;
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
              oldValue > newValue ? oldValue - offset : oldValue + offset
            }px)`,
          },
        ])
        .play();
    }, 20);
  }

  heightSliderClicked($event: MouseEvent) {
    this.triggerApiCall$.next(this.sliderValue);
  }
}
