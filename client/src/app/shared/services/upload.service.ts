import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StreamType, UploadResponse } from '../models/stream';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private uploadData: { [type in StreamType]?: UploadResponse } = { };

  constructor(protected http: HttpClient) { }

  public async init(peerId: string, roomId: string) {
    const { uploadUrl } = environment.server;

    await Promise.all(
      Object.keys(StreamType).map(async (recordingType) => {
        const requestObj = {
          peerId, roomId,
          recordingType,
          mimetype: 'video/webm'
        };

        this.uploadData[ recordingType ] = await this.http
          .post<UploadResponse>(uploadUrl, requestObj)
          .toPromise()
      })
    );
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
}
