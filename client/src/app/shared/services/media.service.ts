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

  public webcamStream: MediaStream;
  public screenStream: MediaStream;

  private streamingSubject = new BehaviorSubject(false);
  public get streaming$() { return this.streamingSubject.asObservable(); }
  public set streaming(toggleStreamingState: boolean) { this.streamingSubject.next(toggleStreamingState); }

  private disconnectRequestSubject = new BehaviorSubject(false);
  public get disconnectRequest$() { return this.disconnectRequestSubject.asObservable(); }

  private remoteWebcamStream: MediaStream;
  private remoteScreenStream: MediaStream;

  constructor() { }

  private async loadStreams() {
    try {
      console.log('loadStreams');
      const [ userStream, screenStream ] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }),

        // @ts-ignore
        navigator.mediaDevices.getDisplayMedia({ audio: true, video: { deviceId: 1 } })
      ]);

      this.webcamStream = userStream;
      this.screenStream = screenStream;

      this.streamingSubject.next(true);
      console.log(this.streamingSubject.value);
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
    if (preferences.screen) streams.screen = this.remoteScreenStream;

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

    this.streamingSubject.next(false);
    this.streamingSubject.complete();

    this.webcamStream = null;
    this.screenStream = null;
    this.remoteWebcamStream = null;
    this.remoteScreenStream = null;
  }

  public requestDisconnect() {
    this.disconnectRequestSubject.next(true);
  }
}
