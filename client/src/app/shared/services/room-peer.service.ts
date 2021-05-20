import { Injectable } from '@angular/core';
import { PeerService } from './peer.service';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { environment } from '../../../environments/environment';
import { ChatService } from './chat.service';
import { ChatMessage, Message, MessageType } from '../models/message';
import { Events } from '../models/events';
import { MediaService } from './media.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Injectable({
  providedIn: 'root'
})
export class RoomPeerService extends PeerService {

  protected peer: Peer;
  protected peerId: string;
  protected connection: DataConnection;

  protected username: string;
  protected roomId: string;
  protected call: MediaConnection;

  constructor(protected chatService: ChatService) {
    super();
  }

  public connect(roomId: string, username: string) {
    const { url, path, port } = environment.server;
    const secure = environment.production;

    this.peer = new Peer({
      path, port, secure,
      host: url, debug: 2,
    });
    console.log('Peer created');

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

    this.call.close();
    this.peer.destroy();
    this.peer = null;
    this.peerId = null;
    return true;
  }

  public initiateCall(stream: MediaStream) {
    this.call = this.peer.call(this.roomId, stream);
  }

  public onConnectionOpen = () => {
    console.log('onConnectionOpen');
    this.connectedSubject.next(true);
    console.log(this.connectedSubject.value);

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

  public onConnectionData = (data) => {
    console.log('onConnectionData');
    const { type, payload } = Message.parse(data);

    switch (type) {
      case Events.chatMessage:
        const { username, message, ts } = payload as ChatMessage;
        const chatMessageType = (payload as ChatMessage).type;
        this.chatService.newMessage({
          username, message, ts,
          from: 'supervisor',
          type: chatMessageType
        });
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
