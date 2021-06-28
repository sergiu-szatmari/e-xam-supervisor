import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedEventsService {
  protected connectedSubject = new BehaviorSubject(false);
  public get connected$() { return this.connectedSubject.asObservable(); }
  public set connected(connected: boolean) { this.connectedSubject.next(connected); }

  constructor(private http: HttpClient) { }

  public async wakeUpServer() {
    const { baseUrl } = environment.server;
    const { message } = await this.http
      .get<{ message }>(`${ baseUrl }/wake-up`)
      .toPromise();

    const isServerUp = message === `I'm awake`;
    console.log(isServerUp ? 'Server is up' : 'Server is down');
    return isServerUp;
  }
}
