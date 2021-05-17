import { Injectable } from '@angular/core';
import { MediaStreamsObject } from '../models/media';

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
    } catch (err) {
      console.error(err);
      // TODO: Proper error handling
    }
  }

  public async getStreamRef(): Promise<MediaStreamsObject> {
    if (!this.webcamStream || !this.screenStream) await this.loadStreams();

    return { user: this.webcamStream, screen: this.screenStream };
  }

  public closeStreams() {
    const streams = [
      this.webcamStream,
      this.screenStream,
      this.remoteWebcamStream,
      this.remoteScreenStream,
    ];

    streams.forEach((stream) => {
      stream?.getTracks().forEach(track => track.stop());
    });

    this.webcamStream = null;
    this.screenStream = null;
    this.remoteWebcamStream = null;
    this.remoteScreenStream = null;
  }
}
