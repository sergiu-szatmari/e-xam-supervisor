import { Injectable } from '@angular/core';
import { MediaStreamsObject } from '../models/media';
import { BehaviorSubject } from 'rxjs';
import { StreamOptions, StreamType } from '../models/stream';
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  public webcamStream: MediaStream;
  public screenStream: MediaStream;

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

  public remoteWebcamStream: MediaStream;
  public remoteScreenStream: MediaStream;

  private webcamRecorder: RecordRTC;
  private screenRecorder: RecordRTC;
  private webcamStreamChunks = [];
  private screenStreamChunks = [];

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

      const isRecordingEnabled = environment.recording;
      if (isRecordingEnabled) {

        this.webcamRecorder = new RecordRTC(this.webcamStream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp8',
          timeSlice: 100,
          ondataavailable: (blob) => this.webcamStreamChunks.push(blob)
        });
        this.screenRecorder = new RecordRTC(this.screenStream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp8',
          timeSlice: 100,
          ondataavailable: (blob) => this.screenStreamChunks.push(blob)
        });

        this.webcamRecorder.startRecording();
        this.screenRecorder.startRecording();
      }

      this.streamingSubject.next(true);
    } catch (err) {
      console.error(err);
      // TODO: Proper error handling
    }
  }

  public stopRecording() {
    this.webcamRecorder.stopRecording(async () => {
      // const blob = await userRecorder.getBlob();
      const blob = new Blob(this.webcamStreamChunks, { type: 'video/webm;codecs=vp8' });
      invokeSaveAsDialog(blob, 'webcam-recording');
    });
    this.screenRecorder.stopRecording(async () => {
      // const blob = await screenRecorder.getBlob();
      const blob = new Blob(this.screenStreamChunks, { type: 'video/webm;codecs=vp8' });
      invokeSaveAsDialog(blob, 'screen-recording');
    });
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

    const isRecordingEnabled = environment.recording;
    if (isRecordingEnabled) this.stopRecording();
  }

  public requestDisconnect() {
    this.disconnectRequestSubject.next(true);
  }

  public requestBackToGridView() {
    this.backToGridViewRequestSubject.next(true);
  }
}
