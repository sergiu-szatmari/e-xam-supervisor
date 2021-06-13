import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  baseUrl: string;

  private tokenSubject = new BehaviorSubject(null);
  public get token$() { return this.tokenSubject.asObservable(); }

  constructor(protected http: HttpClient) {
    this.baseUrl = environment.server.baseUrl;
  }

  public async setupPassword(roomId: string, password: string, timeout: number) {
    const { authToken } = await this.http
      .put<{ authToken: string }>(`${ this.baseUrl }/meetings/${ roomId }`, { password, timeout })
      .toPromise();

    this.tokenSubject.next(authToken);
  }

  public async checkPassword(roomId: string, username: string, password: string) {
    const { authToken } = await this.http
      .post<{ authToken: string }>(`${ this.baseUrl }/meetings/${ roomId }`, { username, password })
      .toPromise();

    this.tokenSubject.next(authToken);
  }

  public async leaveRoom(roomId: string) {
    await this.http
      .delete<{ }>(`${ this.baseUrl }/meetings/${ roomId }`)
      .toPromise();

    this.tokenSubject.next(null);
  }
}
