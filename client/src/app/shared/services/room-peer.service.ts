import { Injectable } from '@angular/core';
import { PeerService } from './peer.service';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { environment } from '../../../environments/environment';
import { ChatService } from './chat.service';
import { ChatMessage, Message, MessageType, StreamToggleOptions } from '../models/message';
import { Events } from '../models/events';
import { MediaService } from './media.service';
import { StreamType } from '../models/stream';

@Injectable({
  providedIn: 'root'
})
export class RoomPeerService extends PeerService {

  protected peer: Peer;
  protected peerId: string;
  protected connection: DataConnection;

  protected username: string;
  protected roomId: string;
  protected userCall: MediaConnection;
  protected screenCall: MediaConnection;

  constructor(
    protected chatService: ChatService,
    protected mediaService: MediaService
  ) {
    super();
  }

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
    this.connectedSubject.next(true);

    // Adding the first info message in chat
    this.chatService.newMessage({
      from: 'system', username: 'System',
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
      case Events.chatMessage:
        const { username, message, ts } = payload as ChatMessage;
        const chatMessageType = (payload as ChatMessage).type;
        this.chatService.newMessage({
          username, message, ts,
          from: 'supervisor',
          type: chatMessageType
        });
        break;

      case Events.streamToggle:
        const { from, stream: streamOptions, toggle } = payload as StreamToggleOptions;

        // Bad sender
        if (from !== this.roomId) return;

        if (!toggle) {
          if (streamOptions.user) {
            // this.userCall.close();
            this.userCall = null;
          }
          if (streamOptions.screen) {
            this.screenCall.close();
            this.screenCall = null;
          }
        } else {
          const streams = await this.mediaService.getStreamClone(streamOptions);
          if (streamOptions.user) this.initiateCall(streams.user, StreamType.user);
          if (streamOptions.screen) this.initiateCall(streams.screen, StreamType.screen);
          console.log({ streams });
        }
        break;
    }
  }

  public sendChatMessage(chatMessage: string) {
    this.connection.send(Message.create({
      type: Events.chatMessage,
      payload: {
        from: this.peerId,
        username: this.username,
        message: chatMessage,
        type: MessageType.chat,
        ts: new Date()
      }
    }))
  }
}
