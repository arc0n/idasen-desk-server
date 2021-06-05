import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BaseResourceService {
  private baseUrl = 'http://localhost:8100/desk';
  constructor(private http: HttpClient) {}

  public connectDesk(): Observable<string> {
    console.log('service called');

    return this.http
      .post<string>(this.baseUrl + '/connect/e6:d1:b5:45:f6:dd', {})
      .pipe(
        catchError((e) => {
          console.log(e);
          return of('error');
        })
      );
  }

  public getStatus(): Observable<string> {
    console.log('service called');

    return this.http.get<string>(this.baseUrl + '/status', {}).pipe(
      catchError((e) => {
        console.log(e);
        return of('error');
      })
    );
  }
}
