import {Component, OnInit} from '@angular/core';
import {BaseResourceService} from "../../services/base-resource.service";
import {interval, Observable, of, Subscription} from "rxjs";
import {catchError, switchMap} from "rxjs/operators";
import {Pcinfos} from "../../models/pcinfos";

@Component({
  selector: 'app-info-screen',
  templateUrl: 'info-screen-page.component.html',
  styleUrls: ['info-screen-page.component.scss'],
})
export class InfoScreenPage implements OnInit {
  constructor(private service: BaseResourceService) {}

  private subscriptions: Subscription[] = [];
  info: Pcinfos;
  isConnected: boolean;
  color: any;

  /** @internal */
  cpuClocksAvg: number;
  mbTempsAvg: number;
  gpuLoadsAvg: number;
  gpuFanPercent: number;
  mbFanPercent: number[] = [];
  isConnected: Subscription;

  ngOnInit() {
    this.service.getStoredColor().subscribe((color)=>this.color = color);
    this.service.checkConnection().pipe(catchError(()=> {
      this.isConnected = false;
      return of(null);
    })).subscribe(() => this.isConnected = true)
    this.subscriptions.push(
      interval(1000).pipe(
        switchMap((_) => {
          return this.service.getPcInfos().pipe(catchError(() => {
            this.isConnected = false;
            return of(null);
          }))
        })
      ).subscribe(receivedPcInfos => {
        if(!receivedPcInfos) return;
        this.isConnected = true;
        this.info = receivedPcInfos;
        this.cpuClocksAvgCalculus();
        this.mbTempsAvg = this.calculateAvg(this.info.mbTemps);
        this.gpuLoadsAvg = this.calculateAvg(this.info.gpuLoads);
        this.gpuFanPercent = this.calculateFanPercent(this.info.gpuFan);
        this.mbFanPercent[0] = this.calculateFanPercent(this.info.mbFans[0]);
        this.mbFanPercent[1] = this.calculateFanPercent(this.info.mbFans[1]);
        this.mbFanPercent[2] = this.calculateFanPercent(this.info.mbFans[2]);
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  cpuClocksAvgCalculus() {
    let tempAvgNumber = 0;
    let cpuCores = this.info.cpuClocks;

    cpuCores.forEach((cpuCore, index) => {
      if (index === 0) return;
      tempAvgNumber += parseFloat(cpuCore.Value);
    });
    this.cpuClocksAvg = tempAvgNumber / cpuCores.length - 1;
  }

  calculateAvg(array: { Value: any }[]): number {
    let average = 0;
    array.forEach((element, index) => {
      average += parseFloat(element.Value);
    });
    return average / array.length;
  }

  calculateFanPercent(fan: { Value: any; Min: any; Max: any }): number {
    let constante = parseFloat(fan.Max) - parseFloat(fan.Min);
    let value = parseFloat(fan.Value) - parseFloat(fan.Min);
    return value / constante;
  }

  setProgressColor(percentage: number): string {
    if (percentage >= 0.66) return 'danger';
    if (percentage >= 0.33) return 'warning';
    return 'success';
  }
}
