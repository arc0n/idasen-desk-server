import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable, of} from 'rxjs';
import {catchError, map, mergeAll, mergeMap, retry, timeout} from 'rxjs/operators';
import {StorageService} from './storage.service';
import {Desk, MemoryPositions} from '../models/desk';
import {Pcinfos} from '../models/pcinfos';

const IP_KEY = 'server-ip';
const PORT_KEY = 'server-port';
const MEMORY_KEY_1 = 'memory1'
const MEMORY_KEY_2 = 'memory2'
const MEMORY_KEY_3 = 'memory3'

@Injectable()
export class BaseResourceService {
  private baseUrl;

  constructor(private http: HttpClient, private storageSrv: StorageService) {
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

  public getStoredConnectionData(): Observable<{ ip: string; port: number }> {
    return from(
      Promise.all([this.storageSrv.get(IP_KEY), this.storageSrv.get(PORT_KEY)])
    ).pipe(
      map(([ip, port]) => {
        if (!port || !ip) {
          this.baseUrl = `http://localhost:${3000}/`;
          return {ip: 'localhost', port: 3000}
        }
        this.baseUrl = `http://${ip}:${port}/`;
        return {ip, port};
      })
    );
  }

  public getMemoryPositions(): Observable<MemoryPositions> {
    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>
     this.http.get<MemoryPositions>(
      this.baseUrl + 'desk/memory').pipe(
      mergeMap(
        (positions) => {
          if (!positions) return of(null);
          return of(this.writeMemoryToLocalStorage(positions)).pipe(
            map(()=> positions)
          );
        }
      ))))
  }

  private writeMemoryToLocalStorage(positions: MemoryPositions): Promise<void> {
    return Promise.all([
      this.storageSrv.set(MEMORY_KEY_1, positions.position1 || 8),
      this.storageSrv.set(MEMORY_KEY_2, positions.position2 || 15),
      this.storageSrv.set(MEMORY_KEY_3, positions.position3 || 54)]).then()
  }

  public putMemoryPositions(positions: MemoryPositions): Observable<any> {
    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>{
        this.writeMemoryToLocalStorage(positions);
    return this.http.post(this.baseUrl + '/desk/memory', positions)}))
  }

  public searchForDesk() {
    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>
     this.http.get<Desk[]>(this.baseUrl + 'desk/search', {})))
  }

  public getPcInfos() {
    return this.getStoredConnectionData().pipe(
      mergeMap(()=>
        this.http.get<Pcinfos>(this.baseUrl + 'pcinfos', {})
    ))
  }

  public connectDesk(): Observable<boolean> {

    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>
     this.http.post<any>(
      this.baseUrl + 'desk/connect/e6:d1:b5:45:f6:dd',
      {}
    )))
  }

  public disconnectDesk(): Observable<boolean> {
    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>
        this.http.post<any>(this.baseUrl + 'desk/disconnect', {})))
  }

  public getStatus(): Observable<string> {

    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>
     this.http.get<any>(this.baseUrl + 'desk/status', {})))
  }

  public moveDesk(targetPosition: number): Observable<any> {

    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>
     this.http.post<any>(
      `${this.baseUrl}desk/move/${targetPosition}`,
      {}
    )))
  }

  checkConnection(): Observable<boolean> {

    return  this.getStoredConnectionData().pipe(
      mergeMap(()=>
     this.http.get<any>(this.baseUrl + 'ping', {}).pipe(
      timeout(1000),
      catchError(() => of(false)),
      map((value) => !!value)
    )))
  }
}
