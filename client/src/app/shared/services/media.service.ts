import { Injectable } from '@angular/core';
import { MediaStreamsObject, StreamOptions, StreamType, SupportedRecordRTCMimeTypes } from '../models/stream';
import RecordRTC from 'recordrtc';
import { environment } from '../../../environments/environment';
import { UploadService } from './upload.service';
import { SharedEventsService } from './shared-events.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  public webcamStream: MediaStream;
  public screenStream: MediaStream;

  public remoteWebcamStream: MediaStream;
  public remoteScreenStream: MediaStream;

  private webcamRecorder: RecordRTC;
  private screenRecorder: RecordRTC;

  constructor(
    protected uploadService: UploadService,
    protected sharedEvents: SharedEventsService,
  ) { }

  public peerId: string;
  public roomId: string;

  private async loadStreams() {
    try {
      const [ userStream, screenStream ] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }),

        // @ts-ignore
        navigator.mediaDevices.getDisplayMedia({ audio: true, video: { deviceId: 1 } })
      ]);

      this.webcamStream = userStream;
      this.screenStream = screenStream;

      const isRecordingEnabled = environment.recording.enabled;
      if (isRecordingEnabled) {
        const { mimeType } = environment.recording;
        if (!SupportedRecordRTCMimeTypes.includes(mimeType)) throw new Error('Invalid mimeType for RecordRTC object');

        await this.uploadService.init(this.peerId, this.roomId);

        const recordRTCOptions: any = {
          type: 'video',
          mimeType,
          timeSlice: 2000,
        };
        this.webcamRecorder = new RecordRTC(this.webcamStream, {
          ...recordRTCOptions,
          ondataavailable: async (blob) =>
            this.uploadService.upload(StreamType.user, blob)
        });
        this.screenRecorder = new RecordRTC(this.screenStream, {
          ...recordRTCOptions,
          ondataavailable: async (blob) =>
            this.uploadService.upload(StreamType.screen, blob)
        });

        this.webcamRecorder.startRecording();
        this.screenRecorder.startRecording();
      }

      this.sharedEvents.streaming = true;
    } catch (err) {
      console.error(err);
      // TODO: Proper error handling
    }
  }

  public stopRecording() {
    this.webcamRecorder.stopRecording(async () =>
      this.uploadService.upload(StreamType.user,this.webcamRecorder.getBlob())
    );

    this.screenRecorder.stopRecording(async () =>
      this.uploadService.upload(StreamType.screen,this.screenRecorder.getBlob())
    );
  }

  public async getStreams(): Promise<MediaStreamsObject> {
    if (!this.webcamStream || !this.screenStream) await this.loadStreams();

    if (!this.remoteWebcamStream || !this.remoteScreenStream) {
      this.remoteWebcamStream = this.webcamStream.clone();
      this.remoteScreenStream = this.screenStream.clone();
    }

    return {
      user: this.remoteWebcamStream,
      screen: this.remoteScreenStream
    };
  }

  public closeStreams() {
    if (environment.recording.enabled) this.stopRecording();

    [ this.webcamStream,
      this.screenStream,
      this.remoteWebcamStream,
      this.remoteScreenStream,
    ].forEach((stream) => {
      stream?.getTracks().forEach(track => track.stop());
    });

    this.sharedEvents.streaming = false;

    this.webcamStream = null;
    this.screenStream = null;
    this.remoteWebcamStream = null;
    this.remoteScreenStream = null;
  }
}
