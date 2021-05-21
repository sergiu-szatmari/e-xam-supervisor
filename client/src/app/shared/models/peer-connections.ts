import { DataConnection, MediaConnection } from 'peerjs';

export interface PeerConnections {
  [remotePeerId: string]: {
    username?: string;
    dataConnection: DataConnection,
    streams: MediaStream[],
    calls: MediaConnection[],
  }
}
