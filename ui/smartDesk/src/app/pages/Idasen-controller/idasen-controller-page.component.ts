import {Component, OnDestroy, OnInit} from '@angular/core';
import { BaseResourceService } from '../../services/base-resource.service';
import {debounce, debounceTime, map, switchMap} from 'rxjs/operators';
import {Subject, Subscription} from "rxjs";

@Component({
  selector: 'app-idasen-controller',
  templateUrl: 'idasen-controller-page.component.html',
  styleUrls: ['idasen-controller-page.component.scss'],
})
export class IdasenControllerPage implements OnInit, OnDestroy{
  triggerApiCall = new Subject<number>()
  sliderValue: any ="noVal";

  constructor(private service: BaseResourceService) {}
  private subscriptions : Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(
      this.triggerApiCall.pipe(
        debounceTime(1000),
        switchMap((value: number)=> {
         return this.service.moveDesk(value)
        })
      ).subscribe()
    )
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

  heightSliderChange(value) {
    console.log(value)
    this.sliderValue=value.detail.value;
    this.triggerApiCall.next(value.detail.value);
  }
}
