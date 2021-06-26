import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Desk } from '../models/desk';
import { Pcinfos } from '../models/pcinfos';

const IP_KEY = 'server-ip';
const PORT_KEY = 'server-port';
@Injectable()
export class BaseResourceService {
  private baseUrl;
  constructor(private http: HttpClient, private storageSrv: StorageService) {
    this.getStoredData();
  }

  public async setServerIp(ip: string, port: number) {
    const tmp = this.baseUrl;
    this.baseUrl = `http://${ip}:${port}/`;
    if (this.baseUrl !== tmp) {
      await Promise.all([
        this.storageSrv.set(IP_KEY, ip),
        this.storageSrv.set(PORT_KEY, port),
      ]);
    }
  }

  public getStoredData(): Observable<{ ip: string; port: number }> {
    return from(
      Promise.all([this.storageSrv.get(IP_KEY), this.storageSrv.get(PORT_KEY)])
    ).pipe(
      map(([ip, port]) => {
        this.baseUrl = `http://${ip}:${port}/`;
        return { ip, port };
      })
    );
  }

  public searchForDesk() {
    return this.http.get<Desk[]>(this.baseUrl + 'desk/search', {});
  }

  public getPcInfos() {
    return this.http.get<Pcinfos>(this.baseUrl + 'pcinfos', {});
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

  public moveDesk(targetPosition: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}move/${targetPosition}`, {});
  }

  checkConnection(): Observable<boolean> {
    return this.http.get<any>(this.baseUrl + 'ping', {}).pipe(
      timeout(1000),
      catchError(() => of(false)),
      map((value) => !!value)
    );
  }
}
