export enum RecordingType {
  user = 'user',
  screen = 'screen'
}

export interface UploadRequestBody {
  roomId: string;
  peerId: string;
  recordingType: RecordingType;
  mimeType: string;
}
