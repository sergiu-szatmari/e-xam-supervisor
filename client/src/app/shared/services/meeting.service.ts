import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(protected http: HttpClient) { }

  private tokenSubject = new BehaviorSubject(null);
  public get token$() { return this.tokenSubject.asObservable(); }

  public async setupPassword(roomId: string, password: string, timeout: number) {
    const { baseUrl } = environment.server;
    const { authToken } = await this.http
      .put<{ authToken: string }>(`${ baseUrl }/meetings/${ roomId }`, { password, timeout })
      .toPromise();
    this.tokenSubject.next(authToken);
  }

  public async checkPassword(roomId: string, username: string, password: string) {
    const { baseUrl } = environment.server;
    const { authToken } = await this.http
      .post<{ authToken: string }>(`${ baseUrl }/meetings/${ roomId }`, { username, password })
      .toPromise();
    this.tokenSubject.next(authToken);
  }

  public async leaveRoom(roomId: string) {
    const { baseUrl } = environment.server;
    await this.http
      .delete<{ }>(`${ baseUrl }/meetings/${ roomId }`)
      .toPromise();
    this.tokenSubject.next(null);
  }
}
