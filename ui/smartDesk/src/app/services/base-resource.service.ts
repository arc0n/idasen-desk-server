import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, from, Observable, of } from 'rxjs';
import {
  catchError,
  combineAll,
  concatAll,
  finalize,
  map,
  mergeAll,
  tap,
} from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Desk } from '../models/desk';
import { ModalController, ToastController } from '@ionic/angular';

const IP_KEY = 'server-ip';
const PORT_KEY = 'server-port';
@Injectable()
export class BaseResourceService {
  private baseUrl = 'http://localhost:3000/desk';
  constructor(private http: HttpClient, private storageSrv: StorageService) {}

  public setServerIp(ip: string, port: number) {
    this.baseUrl = `http://${ip}:${port}/`;
    this.storageSrv.set(IP_KEY, ip);
    this.storageSrv.set(PORT_KEY, port);
  }

  public getStoredData(): Observable<{ ip: string; port: number }> {
    return from(
      Promise.all([this.storageSrv.get(IP_KEY), this.storageSrv.get(PORT_KEY)])
    ).pipe(map(([ip, port]) => ({ ip, port })));
  }

  public searchForDesk() {
    return this.http.get<Desk[]>(this.baseUrl + 'desk/search', {});
  }

  public connectDesk(): Observable<boolean> {
    return this.http.post<any>(
      this.baseUrl + 'desk/connect/e6:d1:b5:45:f6:dd',
      {}
    );
  }
  public disconnectDesk(): Observable<boolean> {
    return this.http.post<any>(this.baseUrl + 'desk/disconnect', {});
  }

  public getStatus(): Observable<string> {
    return this.http.get<any>(this.baseUrl + 'desk/status', {});
  }

  moveDesk(targetPosition: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/desk/move/${targetPosition}`,
      {}
    );
  }

  checkConnection(): Observable<boolean> {
    return this.http.get<any>(this.baseUrl + '/ping', {}).pipe(
      catchError(() => of(false)),
      map((value) => value)
    );
  }
}
