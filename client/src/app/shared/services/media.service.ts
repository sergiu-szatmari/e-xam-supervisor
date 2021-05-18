import { Injectable } from '@angular/core';
import { MediaStreamsObject } from '../models/media';
import { BehaviorSubject } from 'rxjs';

interface StreamOptions {
  user: boolean;
  screen: boolean
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private webcamStream: MediaStream;
  private screenStream: MediaStream;

  private webcamStreamSubject = new BehaviorSubject(null);
  public get webcamStream$() { return this.webcamStreamSubject.asObservable(); }

  private screenStreamSubject = new BehaviorSubject(null);
  public get screenStream$() { return this.screenStreamSubject.asObservable(); }

  private remoteWebcamStream: MediaStream;
  private remoteScreenStream: MediaStream;

  constructor() { }

  private async loadStreams() {
    try {
      const [ userStream, screenStream ] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }),

        // @ts-ignore
        navigator.mediaDevices.getDisplayMedia({ audio: true, video: { deviceId: 1 } })
      ]);

      this.webcamStream = userStream;
      this.screenStream = screenStream;

      this.webcamStreamSubject.next(this.webcamStream);
      this.screenStreamSubject.next(this.screenStream);
    } catch (err) {
      console.error(err);
      // TODO: Proper error handling
    }
  }

  public async getStreamRef(): Promise<MediaStreamsObject> {
    if (!this.webcamStream || !this.screenStream) await this.loadStreams();

    return { user: this.webcamStream, screen: this.screenStream };
  }

  public async getStreamClone(preferences: StreamOptions): Promise<MediaStreamsObject> {
    if (!this.webcamStream || !this.screenStream) await this.loadStreams();

    if (!this.remoteWebcamStream || !this.remoteScreenStream) {
      this.remoteWebcamStream = this.webcamStream.clone();
      this.remoteScreenStream = this.screenStream.clone();
    }

    const streams: any = { };
    if (preferences.user) streams.user = this.remoteWebcamStream;
    if (preferences.screen) streams.user = this.remoteScreenStream;

    return streams;
  }

  public closeStreams() {
    [ this.webcamStream,
      this.screenStream,
      this.remoteWebcamStream,
      this.remoteScreenStream,
    ].forEach((stream) => {
      stream?.getTracks().forEach(track => track.stop());
    });

    this.webcamStreamSubject.next(null);
    this.webcamStreamSubject.complete();
    this.screenStreamSubject.next(null);
    this.screenStreamSubject.complete();

    this.webcamStream = null;
    this.screenStream = null;
    this.remoteWebcamStream = null;
    this.remoteScreenStream = null;
  }
}
