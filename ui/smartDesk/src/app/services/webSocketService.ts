import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Observable, of, Subject } from 'rxjs';
@Injectable()
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  public messages$: Subject<number> = new Subject();
  private wsEndpoint: string;

  public async connect(endPoint: string): Promise<boolean> {
    this.wsEndpoint = endPoint;
    return new Promise((res, rej) => {
      if (!this.socket$ || this.socket$.closed) {
        this.socket$ = this.getNewWebSocket();
        this.socket$
          .pipe(
            catchError(() => {
              res(false);
              this.socket$ = null;
              return of(null);
            })
          )
          .subscribe((el) => {
            if (!el) return;
            this.messages$.next(el);
            res(true);
          });
      }
    });
  }

  private getNewWebSocket() {
    if (!this.wsEndpoint) {
      console.log('NO ENDPOINT SELECTED');
      return;
    }
    return webSocket(this.wsEndpoint);
  }
  sendMessage(msg: any) {
    this.socket$.next(msg);
  }
  close() {
    this.socket$.complete();
  }
}
