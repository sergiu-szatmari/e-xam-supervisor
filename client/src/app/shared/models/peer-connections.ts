import { DataConnection, MediaConnection } from 'peerjs';
import { StreamType } from './stream';

export interface PeerConnections {
  [remotePeerId: string]: {
    username?: string;
    dataConnection: DataConnection,
    streams: { type: StreamType, stream: MediaStream }[],
    calls: MediaConnection[],
  }
}
