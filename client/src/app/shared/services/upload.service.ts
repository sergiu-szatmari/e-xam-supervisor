import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StreamType, UploadResponse } from '../models/stream';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(protected http: HttpClient) { }

  public async upload(streamType: StreamType,
                      senderPeerId: string,
                      roomId: string,
                      blob?: Blob) {
    const requestObj = {
      peerId: senderPeerId,
      recordingType: streamType,
      mimetype: 'video/webm',
      roomId
    };

    const { uploadUrl } = environment.server;
    const uploadData = await this.http
      .post<UploadResponse>(uploadUrl, requestObj)
      .toPromise();

    const formData = new FormData();
    Object.entries(uploadData.fields).forEach(([ key, value ]) => {
      formData.append(key, value);
    });
    formData.append('file', blob);

    const resp = await this.http
      .post(uploadData.url, formData)
      .toPromise();
    console.log({ resp });
  }
}
