import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class PeerService {

  protected connectedSubject = new BehaviorSubject(false);
  public get connected$() { return this.connectedSubject.asObservable(); }

  protected constructor() { }

  public abstract disconnect(): boolean;
}
