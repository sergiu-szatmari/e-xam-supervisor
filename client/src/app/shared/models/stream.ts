export enum StreamType {
  user = 'user',
  screen = 'screen',
}

export interface StreamOptions {
  user: boolean;
  screen: boolean;
}

export interface MediaStreamsObject {
  user: MediaStream;
  screen: MediaStream;
}

export const SupportedRecordRTCMimeTypes = [
  'audio/webm',
  'audio/webm;codecs=pcm',
  'video/mp4',
  'video/webm',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm;codecs=h264',
  'video/x-matroska;codecs=avc1',
  'video/mpeg',
  'audio/wav',
  'audio/ogg',
];

export interface UploadResponse {
  url: string;
  fields: {
    'Content-Type': string;
    key: string;
    success_action_redirect: string;
    bucket: string;
    acl: string;
    'X-Amz-Algorithm': string;
    'X-Amz-Credential': string;
    'X-Amz-Date': string;
    Policy: string;
    'X-Amz-Signature': string;
  };
}
