import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
@Injectable()
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  public messages$: Subject<number> = new Subject();
  private wsEndpoint: string;

  public connect(endPoint: string): void {
    this.wsEndpoint = endPoint;
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      this.socket$.subscribe((el) => this.messages$.next(el));
    }
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
