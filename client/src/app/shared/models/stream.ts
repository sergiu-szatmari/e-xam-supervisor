export enum StreamType {
  user = 'user',
  screen = 'screen',
}

export interface StreamOptions {
  user: boolean;
  screen: boolean;
}

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
