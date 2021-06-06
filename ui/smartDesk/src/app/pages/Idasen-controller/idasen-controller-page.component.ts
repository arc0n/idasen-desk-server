import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseResourceService} from '../../services/base-resource.service';
import {debounce, debounceTime, filter, map, retry, switchMap, takeUntil, takeWhile, tap} from 'rxjs/operators';
import {interval, of, Subject, Subscription} from "rxjs";
import {Animation, AnimationController} from '@ionic/angular';


@Component({
  selector: 'app-idasen-controller',
  templateUrl: 'idasen-controller-page.component.html',
  styleUrls: ['idasen-controller-page.component.scss']
})
export class IdasenControllerPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('deskPicture', {static: false}) deskPicture: any
  triggerApiCall$ = new Subject<number>()
  interval: any;
  sliderValue: number;

  constructor(private service: BaseResourceService, private animationCtrl: AnimationController) {

  }

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(
      this.triggerApiCall$.pipe(
        debounceTime(1000),
        switchMap((value: number) => {
          return this.service.moveDesk(value)
        })
      ).subscribe((val) => {
        // TODO
      }));

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /** @internal */
  connectToDesk() {
    this.service.connectDesk().subscribe((val) => {
      console.log('value received: ', val);
    });
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
            {offset: 1, transform: `translateY(-${oldValue > this.sliderValue ? oldValue - offset : oldValue + offset}px)`},

          ]
        ).play();
    }, 10)

  }

  ngAfterViewInit(): void {
    console.log(this.deskPicture?.nativeElement)
  }

}
