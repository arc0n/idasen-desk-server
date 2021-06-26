import {Injectable, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  from, Observable} from 'rxjs';
import { map,} from 'rxjs/operators';
import {StorageService} from "./storage.service";


const IP_KEY = 'server-ip'
const PORT_KEY = 'server-port'
@Injectable()
export class BaseResourceService  {


  private baseUrl = 'http://localhost:3000/desk';
  constructor(private http: HttpClient, private storageSrv: StorageService) {
  }

  public setServerIp(ip: string, port: number) {
    this.baseUrl = `http://${ip}:${port}/desk`;
    this.storageSrv.set(IP_KEY, ip);
    this.storageSrv.set(PORT_KEY, port);
  }

  public getStoredData(): Observable<{ip: string, port: number}> {
    return from(Promise.all([this.storageSrv.get(IP_KEY), this.storageSrv.get(PORT_KEY)])).pipe(
      map(([ip, port]) => ({ip, port}))
    )
  }


  public connectDesk(): Observable<boolean> {
    return this.http
      .post<any>(this.baseUrl + '/connect/e6:d1:b5:45:f6:dd', {});
  }
  public disconnectDesk(): Observable<boolean> {
    return this.http.post<any>(this.baseUrl + '/disconnect', {});
  }

  public getStatus(): Observable<string> {
    return this.http.get<any>(this.baseUrl + '/status', {});
  }

  public moveDesk(targetPosition: number): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/move/${targetPosition}`, {});
  }
}
