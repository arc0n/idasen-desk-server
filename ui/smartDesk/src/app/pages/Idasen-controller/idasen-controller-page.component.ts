import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseResourceService} from '../../services/base-resource.service';
import {debounceTime, switchMap} from 'rxjs/operators';
import {Subject, Subscription} from "rxjs";
import {AnimationController} from '@ionic/angular';
import {WebSocketService} from "../../services/webSocketService";


@Component({
  selector: 'app-idasen-controller',
  templateUrl: 'idasen-controller-page.component.html',
  styleUrls: ['idasen-controller-page.component.scss']
})
export class IdasenControllerPage implements OnInit, OnDestroy {
  @ViewChild('deskPicture', {static: false}) deskPicture: any
  triggerApiCall$ = new Subject<number>()
  interval: any;
  sliderValue: number;

  constructor(private resourcesService: BaseResourceService, private animationCtrl: AnimationController, private webSocket: WebSocketService) {

  }

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.webSocket.connect();
    this.subscriptions.push(
      this.triggerApiCall$.pipe(
        debounceTime(1000),
        switchMap((value: number) => {
          return this.resourcesService.moveDesk(value)
        })
      ).subscribe((val) => {
        // TODO
      }));

    this.subscriptions.push(
      this.webSocket.messages$.subscribe((msg) => {
        console.log(msg)
      })
    )

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


  heightSliderChange(event) {
    const oldValue = this.sliderValue || 0;
    this.sliderValue = event.detail.value;
    this.triggerApiCall$.next(event.detail.value);


    let offset = 0;
    clearInterval(this.interval)
    this.interval = setInterval(() => {
      offset++;

      if (offset === Math.abs(oldValue - this.sliderValue)) {
        clearInterval(this.interval)
        return;
      }
      this.animationCtrl.create()
        .addElement(this.deskPicture?.nativeElement)
        .duration(10)
        .iterations(1)
        .keyframes(
          [
            //   {offset: 0, transform: 'translateY(0px)'},
            {
              offset: 1,
              transform: `translateY(-${oldValue > this.sliderValue ? oldValue - offset : oldValue + offset}px)`
            },

          ]
        ).play();
    }, 10)

  }

}
