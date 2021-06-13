import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StreamType, UploadResponse } from '../models/stream';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private uploadData: { [type in StreamType]?: UploadResponse } = { };
  private chatUploadData: UploadResponse;

  constructor(protected http: HttpClient) { }

  public async init(roomId: string, peerId: string | null) {
    const { baseUrl } = environment.server;

    if (peerId === null) {
      // Supervisor service uploads csv
      const url = `${ baseUrl }/upload/${ roomId }/chat`;

      this.chatUploadData = await this.http
        .post<UploadResponse>(url, { roomId })
        .toPromise();

    } else {
      // Attendee service uploads stream
      let { mimeType } = environment.recording;
      if (mimeType.includes(';')) [ mimeType ] = mimeType.split(';');

      await Promise.all(
        Object.keys(StreamType).map(async (recordingType) => {
          const requestObj = {
            peerId, roomId,
            recordingType,
            mimeType
          };

          this.uploadData[ recordingType ] = await this.http
            .post<UploadResponse>(`${ baseUrl }/upload/${ roomId }`, requestObj)
            .toPromise()
        })
      );
    }
  }

  public async upload(streamType: StreamType, blob?: Blob) {
    const formData = new FormData();
    Object.entries(this.uploadData[ streamType ].fields).forEach(([ key, value ]) => {
      formData.append(key, value);
    });
    formData.append('file', blob);

    await this.http
      .post(this.uploadData[ streamType ].url, formData)
      .toPromise();
  }

  public async uploadChat(blob: Blob) {
    const formData = new FormData();
    Object.entries(this.chatUploadData.fields)
      .forEach(([ key, value ]) => {
        formData.append(key, value);
    });
    formData.append('file', blob);

    await this.http
      .post(this.chatUploadData.url, formData)
      .toPromise();
  }
}
