export enum StreamType {
  user = 'user',
  screen = 'screen',
}

export interface StreamOptions {
  user: boolean;
  screen: boolean;
}
