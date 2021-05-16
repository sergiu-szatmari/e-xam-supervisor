import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeerService {

  private connectedSubject = new BehaviorSubject(false);
  public get connected$() { return this.connectedSubject.asObservable() }
  public set connected(value: boolean) { this.connectedSubject.next(value); }

  private leaveRoomSubject = new BehaviorSubject(false)
  public get leaveRoom$() { return this.leaveRoomSubject.asObservable(); }
  public set leaveRoom(disconnect: boolean) { this.leaveRoomSubject.next(disconnect); }

  constructor() { }
}
