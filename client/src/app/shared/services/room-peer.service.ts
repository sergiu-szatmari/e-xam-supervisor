import { Injectable } from '@angular/core';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { environment } from '../../../environments/environment';
import { ChatService } from './chat.service';
import { ChatMessage, Message, MessageType, StreamToggleOptions } from '../models/message';
import { Events } from '../models/events';
import { MediaService } from './media.service';
import { StreamType } from '../models/stream';
import { SharedEventsService } from './shared-events.service';

@Injectable({
  providedIn: 'root'
})
export class RoomPeerService {

  protected peer: Peer;
  public peerId: string;
  protected connection: DataConnection;

  protected username: string;
  protected roomId: string;
  protected userCall: MediaConnection;
  protected screenCall: MediaConnection;

  constructor(
    protected chatService: ChatService,
    protected mediaService: MediaService,
    protected sharedEvents: SharedEventsService,
  ) { }

  public connect(roomId: string, username: string) {
    const { url, path, port } = environment.server;
    const secure = environment.production;

    this.peer = new Peer({
      path, port, secure,
      host: url, debug: 2,
    });

    this.peer.on('open', () => {
      this.peerId = this.peer.id;
      this.roomId = roomId;
      this.username = username;
      this.mediaService.peerId = this.peerId;
      this.mediaService.roomId = this.roomId;

      this.connection = this.peer.connect(this.roomId);
      this.connection.on('open', this.onConnectionOpen);
      this.connection.on('data', this.onConnectionData);
      this.connection.on('error', console.error);
    });
  }

  public disconnect(): boolean {
    if (!this.peer || !this.peerId) return false;

    this.userCall?.close();
    this.screenCall?.close();
    this.connection.close();
    this.peer.disconnect();
    this.peer.destroy();
    this.peer = null;
    this.peerId = null;
    return true;
  }

  public initiateCall(stream: MediaStream, streamType: StreamType) {
    switch (streamType) {
      case StreamType.user:
        this.userCall = this.peer.call(this.roomId, stream, { metadata: StreamType.user });
        console.log(`initiateCall`, this.userCall);
        this.userCall.on('close', () => { console.log('Call closed'); });
        break;

      case StreamType.screen:
        this.screenCall = this.peer.call(this.roomId, stream, { metadata: StreamType.screen });
        console.log(`initiateCall`, this.screenCall);
        this.screenCall.on('close', () => { console.log('Call closed'); });
        break;

      default:
        throw new Error('Invalid stream type.');
    }
  }

  public onConnectionOpen = () => {
    this.sharedEvents.connected = true;

    // Adding the first info message in chat
    this.chatService.newMessage({
      from: { peerId: 'system', username: 'System' },
      to: { peerId: this.peerId, username: this.username },
      message: 'You connected',
      type: MessageType.system,
      ts: new Date()
    });

    // Sending attendee name to supervisor
    this.connection.send(Message.create({
      type: Events.setName,
      payload: { username: this.username }
    }));
  }

  public onConnectionData = async (data) => {
    const { type, payload } = Message.parse(data);
    console.log(`Message received (${ type })`, payload);

    switch (type) {
      case Events.chatMessage: {
        const { from, message, ts, to } = payload as ChatMessage;

        // Bad sender
        if (from.peerId !== this.roomId) return;

        // Bad receiver
        if (to.peerId !== this.peerId) return;

        const chatMessageType = (payload as ChatMessage).type;
        this.chatService.newMessage({
          from, to,
          message, ts,
          type: chatMessageType
        });
        break;
      }

      case Events.streamToggle: {
        const { from, stream: streamOptions, toggle } = payload as StreamToggleOptions;

        // Bad sender
        if (from !== this.roomId) return;

        if (streamOptions.user) this.mediaService.remoteWebcamStream.getTracks().forEach(track => track.enabled = toggle);
        if (streamOptions.screen) this.mediaService.remoteScreenStream.getTracks().forEach(track => track.enabled = toggle);
        break;
      }
    }
  }

  public sendChatMessage(chatMessage: string) {
    this.connection.send(Message.create({
      type: Events.chatMessage,
      payload: {
        from: { peerId: this.peerId, username: this.username },
        to: { peerId: this.roomId, username: 'Supervisor' },
        username: this.username,
        message: chatMessage,
        type: MessageType.chat,
        ts: new Date()
      }
    }));
  }
}
