import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BaseResourceService {
  private baseUrl = 'http://192.168.0.80:3000/desk';
  constructor(private http: HttpClient) {}

  public connectDesk(): Observable<string> {
    return this.http
      .post<any>(this.baseUrl + '/connect/e6:d1:b5:45:f6:dd', {})
      .pipe(
        catchError((e) => {
          console.log(e);
          return of('error');
        })
      );
  }

  public getStatus(): Observable<string> {
    return this.http.get<any>(this.baseUrl + '/status', {}).pipe(
      map((result) => JSON.stringify(result)),
      catchError((e) => {
        console.log(e);
        return of('error');
      })
    );
  }

  moveDesk(targetPosition: number): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/move/${targetPosition}`, {})
      .pipe(
        catchError((e) => {
          console.log(e);
          return of('error');
        })
      );
  }
}
