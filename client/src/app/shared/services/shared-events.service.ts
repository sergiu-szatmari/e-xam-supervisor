import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedEventsService {

  private streamingSubject = new BehaviorSubject(false);
  public get streaming$() { return this.streamingSubject.asObservable(); }
  public set streaming(toggleStreamingState: boolean) { this.streamingSubject.next(toggleStreamingState); }

  private focusedViewSubject = new BehaviorSubject(false);
  public get focusedView$() { return this.focusedViewSubject.asObservable(); }
  public set focusedView(toggleStreamingState: boolean) { this.focusedViewSubject.next(toggleStreamingState); }

  private backToGridViewRequestSubject = new BehaviorSubject(false);
  public get backToGridViewRequest$() { return this.backToGridViewRequestSubject.asObservable(); }

  private disconnectRequestSubject = new BehaviorSubject(false);
  public get disconnectRequest$() { return this.disconnectRequestSubject.asObservable(); }

  constructor() { }

  public requestDisconnect() {
    this.disconnectRequestSubject.next(true);
  }

  public requestBackToGridView() {
    this.backToGridViewRequestSubject.next(true);
  }
}
