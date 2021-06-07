import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(protected http: HttpClient) { }

  public async setupPassword(roomId: string, password: string, timeout: number) {
    const { baseUrl } = environment.server;
    await this.http
      .put(`${ baseUrl }/meetings/${ roomId }`, { password, timeout })
      .toPromise();
  }

  public async checkPassword(roomId: string, password: string) {
    const { baseUrl } = environment.server;
    await this.http
      .post<{ }>(`${ baseUrl }/meetings/${ roomId }`, { password })
      .toPromise();
  }

  public async leaveRoom(roomId: string) {
    // const { baseUrl } = environment.server;
    // await this.http
    //   .delete<{ }>(`${ baseUrl }/meetings/${ roomId }`, { })
    console.log('TODO: MeetingService::leaveRoom');
  }
}
