import { Events } from './events';
import { TypeGuards } from '../utils/type.utils';

// Attendee => Supervisor
export interface SetupPeerInformation {
  username: string;
}

export interface ChatMessage {
  from: string; // Peer ID
  username: string;
  message: string;
  type: MessageType;
  ts: Date;
}


export type PeerMessagePayload = SetupPeerInformation | ChatMessage;

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

    switch (msg.type) {
      case Events.setName:
        if (TypeGuards.isSetupPeerInformation(msg.payload)) {
          msg.payload = msg.payload as SetupPeerInformation;
        }
        break;
      case Events.chatMessage:
        if (TypeGuards.isChatMessage(msg.payload)) {
          msg.payload = msg.payload as ChatMessage;
        }
        break;
    }

    return msg;
  }
}
