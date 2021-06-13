import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedEventsService {
  protected connectedSubject = new BehaviorSubject(false);
  public get connected$() { return this.connectedSubject.asObservable(); }
  public set connected(connected: boolean) { this.connectedSubject.next(connected); }

  constructor() { }
}
