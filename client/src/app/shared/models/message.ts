import { Events } from './events';
import { StreamOptions } from './stream';

// Attendee => Supervisor
export interface SetupPeerInformation {
  username: string;
}

export interface ChatMessage {
  from: {
    peerId: string;
    username: string;
  },
  to?: {
    peerId: string;
    username: string;
  }
  // from: string; // Peer ID
  // to: string; // Peer ID
  // username: string;
  message: string;
  type: MessageType;
  ts: Date;
}

export interface StreamToggleOptions {
  // Peer ID
  from: string;

  // For which the 'toggle action will apply
  stream: StreamOptions;

  // Action:
  //  - true (start/resume streaming)
  //  - false (pause streaming)
  toggle: boolean;
}

export type PeerMessagePayload =
  SetupPeerInformation
  | ChatMessage
  | StreamToggleOptions;

export interface PeerMessage {
  type: Events;
  payload: PeerMessagePayload;
}

export enum MessageType {
  chat = 'chat',
  broadcast = 'broadcast',
  system = 'system'
}

export class Message {
  public static create(obj: PeerMessage): string {
    if (!obj) throw new Error('Invalid message object');
    if (!obj.type || !Object.values(Events).includes(obj.type)) throw new Error('Invalid message object (invalid type)');

    return JSON.stringify(obj);
  }

  public static parse(message: string): PeerMessage {
    const msg = JSON.parse(message) as PeerMessage;

    if (!msg) throw new Error('Invalid message');
    if (!msg.type || !Object.values(Events).includes(msg.type)) throw new Error('Invalid message (invalid type');

    return msg;
  }
}
