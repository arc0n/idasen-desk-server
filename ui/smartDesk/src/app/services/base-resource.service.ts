import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, timeout } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Desk, MemoryPositions } from '../models/desk';
import { Pcinfos } from '../models/pcinfos';

const IP_KEY = 'server-ip';
const PORT_KEY = 'server-port';
const PCIP_KEY = 'pc-ip';
const PCPORT_KEY = 'pc-port';
const MEMORY_KEY_1 = 'memory1';
const MEMORY_KEY_2 = 'memory2';
const MEMORY_KEY_3 = 'memory3';
const INFOCOLOR_KEY = 'textcolor';
const DESK_KEY = 'desk';

@Injectable()
export class BaseResourceService {
  /*  httpOptions = {
    headers: new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
    }),
  };*/
  private baseUrl;

  private deskAddress = 'e6:d1:b5:45:f6:dd';

  constructor(private http: HttpClient, private storageSrv: StorageService) {}

  public async setDeskAddress(address: string) {
    return this.storageSrv.set(DESK_KEY, address);
  }
  public async setServerIp(
    ip: string,
    port: number,
    pcip: string,
    pcport: number
  ) {
    const tmp = this.baseUrl;
    this.baseUrl = `http://${ip}:${port}/`;
    if (this.baseUrl !== tmp) {
      await Promise.all([
        this.storageSrv.set(IP_KEY, ip),
        this.storageSrv.set(PORT_KEY, port),
        this.storageSrv.set(PCIP_KEY, pcip),
        this.storageSrv.set(PCPORT_KEY, pcport),
      ]);
    }
  }

  public getStoredConnectionData(): Observable<{
    ip: string;
    port: number;
    pcip?: string;
    pcport?: number;
  }> {
    return from(
      Promise.all([
        this.storageSrv.get(IP_KEY),
        this.storageSrv.get(PORT_KEY),
        this.storageSrv.get(PCIP_KEY),
        this.storageSrv.get(PCPORT_KEY),
        this.storageSrv.get(DESK_KEY),
      ])
    ).pipe(
      map(([ip, port, pcip, pcport, desk]) => {
        if (!port || !ip) {
          this.baseUrl = `http://localhost:${3000}/`;
          return { ip: 'localhost', port: 3000 };
        }
        this.baseUrl = `http://${ip}:${port}/`;
        this.deskAddress = desk || 'e6:d1:b5:45:f6:dd';
        return { ip, port, pcip, pcport };
      })
    );
  }

  public getMemoryPositions(): Observable<MemoryPositions> {
    return this.getStoredConnectionData().pipe(
      mergeMap(() =>
        this.http.get<MemoryPositions>(this.baseUrl + 'desk/memory').pipe(
          mergeMap((positions) => {
            if (!positions) return of(null);
            return of(this.writeMemoryToLocalStorage(positions)).pipe(
              map(() => positions)
            );
          })
        )
      )
    );
  }

  private writeMemoryToLocalStorage(positions: MemoryPositions): Promise<void> {
    return Promise.all([
      this.storageSrv.set(MEMORY_KEY_1, positions.position1 || 8),
      this.storageSrv.set(MEMORY_KEY_2, positions.position2 || 15),
      this.storageSrv.set(MEMORY_KEY_3, positions.position3 || 54),
    ]).then();
  }

  public putMemoryPositions(positions: MemoryPositions): Observable<any> {
    return this.getStoredConnectionData().pipe(
      mergeMap(() => {
        this.writeMemoryToLocalStorage(positions);
        return this.http.post(this.baseUrl + 'desk/memory', positions);
      })
    );
  }

  public searchForDesk() {
    return this.getStoredConnectionData().pipe(
      mergeMap(() => this.http.get<Desk[]>(this.baseUrl + 'desk/search'))
    );
  }

  public getPcInfos() {
    return this.getStoredConnectionData().pipe(
      mergeMap(() => this.http.get<Pcinfos>(this.baseUrl + 'pcinfos'))
    );
  }

  public async setInfoscreenColor(color: string) {
    await this.storageSrv.set(INFOCOLOR_KEY, color);
  }

  public getStoredColor(): Observable<string> {
    return from(this.storageSrv.get(INFOCOLOR_KEY));
  }

  public connectDesk(): Observable<boolean> {
    return this.getStoredConnectionData().pipe(
      mergeMap(() =>
        this.http.post<any>(
          this.baseUrl +
            'desk/connect/' +
            (this.deskAddress || 'e6:d1:b5:45:f6:dd'),
          {}
        )
      )
    );
  }

  public disconnectDesk(): Observable<boolean> {
    return this.getStoredConnectionData().pipe(
      mergeMap(() => this.http.post<any>(this.baseUrl + 'desk/disconnect', {}))
    );
  }

  public getStatus(): Observable<string> {
    return this.getStoredConnectionData().pipe(
      mergeMap(() => this.http.get<any>(this.baseUrl + 'desk/status'))
    );
  }

  public moveDesk(targetPosition: number): Observable<any> {
    return this.getStoredConnectionData().pipe(
      mergeMap(() =>
        this.http.post<any>(`${this.baseUrl}desk/move/${targetPosition}`, {})
      )
    );
  }

  checkConnection(): Observable<boolean> {
    return this.getStoredConnectionData().pipe(
      mergeMap(() =>
        this.http.get<any>(this.baseUrl + 'ping').pipe(
          timeout(1000),
          catchError(() => of(false)),
          map((value) => !!value)
        )
      )
    );
  }
}
