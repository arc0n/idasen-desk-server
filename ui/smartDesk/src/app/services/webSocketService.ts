import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
export const WS_ENDPOINT = 'ws://localhost:8080'; // todo make dynamic
@Injectable()
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  public messages$: Subject<number> = new Subject();

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      this.socket$.subscribe((el) => this.messages$.next(el));
    }
  }

  private getNewWebSocket() {
    return webSocket(WS_ENDPOINT);
  }
  sendMessage(msg: any) {
    this.socket$.next(msg);
  }
  close() {
    this.socket$.complete();
  }
}
