import { Injectable } from '@angular/core';
import { StreamType, SupportedRecordRTCMimeTypes } from '../models/stream';
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

  public async loadStreams() {
    this.webcamStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

    // @ts-ignore; used for suppressing some errors.
    // ".getDisplayMedia" is provided by the 'webrtc-adapter'
    // but it cannot be found in the official WebRTC typedef files
    this.screenStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: { deviceId: 1 } });

    const isRecordingEnabled = environment.recording.enabled;
    if (isRecordingEnabled) {

      const { mimeType } = environment.recording;
      if (!SupportedRecordRTCMimeTypes.includes(mimeType)) throw new Error('Invalid mimeType for RecordRTC object');

      await this.uploadService.init(this.roomId, this.peerId);

      const options = (type: StreamType): any => ({
        type: 'video',
        mimeType,
        timeSlice: 2000,
        ondataavailable: async (blob: Blob) =>
          this.uploadService.upload(type, blob)
      });
      this.webcamRecorder = new RecordRTC(this.webcamStream, { ...options(StreamType.user) });
      this.screenRecorder = new RecordRTC(this.screenStream, { ...options(StreamType.screen) });

      this.webcamRecorder.startRecording();
      this.screenRecorder.startRecording();
    }

    this.remoteWebcamStream = this.webcamStream.clone();
    this.remoteScreenStream = this.screenStream.clone();

    // this.sharedEvents.streaming = true;
  }

  public closeStreams() {
    if (environment.recording.enabled) {
      // Stopping the recordings
      this.webcamRecorder?.stopRecording(async () => this.uploadService.upload(StreamType.user,this.webcamRecorder.getBlob()));
      this.screenRecorder?.stopRecording(async () => this.uploadService.upload(StreamType.screen,this.screenRecorder.getBlob()));
    }

    [ this.webcamStream,
      this.screenStream,
      this.remoteWebcamStream,
      this.remoteScreenStream,
    ].forEach((stream) => {
      stream?.getTracks().forEach(track => track.stop());
    });

    // this.sharedEvents.streaming = false;

    this.webcamStream = null;
    this.screenStream = null;
    this.remoteWebcamStream = null;
    this.remoteScreenStream = null;
  }
}
