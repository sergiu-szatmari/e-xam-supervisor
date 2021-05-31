import { Injectable } from '@angular/core';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { ChatService } from './chat.service';
import { environment } from '../../../environments/environment';
import { ChatMessage, Message, MessageType, SetupPeerInformation } from '../models/message';
import { Events } from '../models/events';
import { BehaviorSubject } from 'rxjs';
import { PeerConnections } from '../models/peer-connections';
import { StreamOptions, StreamType } from '../models/stream';
import { SharedEventsService } from './shared-events.service';

@Injectable({
  providedIn: 'root'
})
export class SupervisorPeerService {

  protected peer: Peer;
  public peerId: string;

  public connections: PeerConnections = { };
  private connectionsSubject = new BehaviorSubject(this.connections);
  public get connections$() { return this.connectionsSubject.asObservable(); }

  constructor(
    protected chatService: ChatService,
    protected sharedEvents: SharedEventsService
  ) { }

  public connect() {
    const { url, path, port } = environment.server;
    const secure = environment.production;

    this.peer = new Peer({
      path, port, secure,
      host: url, debug: 1,
    });

    this.peer.on('open', this.onPeerOpen);
    this.peer.on('connection', this.onPeerConnection);
    this.peer.on('call', this.onPeerCall);
  }

  public disconnect(): boolean {
    if (Object.keys(this.connections).length > 0) throw new Error('You cannot disconnect while attendees are still connected.');
    if (!this.peer || !this.peerId) return false;

    this.peer.disconnect()
    this.peer.destroy();
    this.peer = null;
    this.peerId = null;
    this.sharedEvents.connected = false;
    return true;
  }

  public onPeerOpen = () => {
    this.peerId = this.peer.id;

    this.sharedEvents.connected = true;

    this.chatService.newMessage({
      from: { peerId: 'system', username: 'System' },
      to: { peerId: this.peerId, username: 'Supervisor' },
      message: 'You connected',
      type: MessageType.system,
      ts: new Date()
    });
  }

  public onPeerConnection = (connection: DataConnection) => {
    if (!this.connections[ connection.peer ]) {
      this.connections[ connection.peer ] = {
        dataConnection: connection,
        streams: [],
        calls: []
      };

      console.log({ connections: this.connections });
      this.connectionsSubject.next(this.connections);
    }
    connection.on('close', this.onConnectionClose(connection.peer));

    connection.on('data', this.onConnectionData(connection.peer));
  }

  public onPeerCall = (call: MediaConnection) => {
    const remotePeerId = call.peer;

    call.on('error', (err) => { console.error(`Call error`, err); })
    call.on('stream', (remoteStream) => {
      if (this.connections[ remotePeerId ]
        .streams
        .find(({ stream }) => stream.id === remoteStream.id)) return;

      if (!Object.values(StreamType).includes(call.metadata)) return;

      const type = call.metadata;
      this.connections[ remotePeerId ].streams.push({ type, stream: remoteStream });
      this.connectionsSubject.next(this.connections);

      console.log(`${ remotePeerId }`);
      console.log(`${ call.metadata } stream -> ${ (call as any).remoteStream.id }`);
    });

    call.on('close', () => {
      if (!this.connections[ remotePeerId ]) return;

      const idx = this.connections[ remotePeerId ]
        .calls
        .findIndex(c => (c as any).options.connectionId === (call as any).options.connectionId);

      if (idx !== -1) {
        this.connections[ remotePeerId ].calls.splice(idx, 1);
        this.connectionsSubject.next(this.connections);
      }
    })

    call.answer();

    if (this.connections[ remotePeerId ]) {
      const { calls, username } = this.connections[ remotePeerId ];

      if (calls.push(call) === 1) {
        // Send 'X has connected' chat message only
        // when the first media connection is emitted
        this.chatService.newMessage({
          from: { peerId: 'system', username: 'System' },
          to: { peerId: this.peerId, username: 'Supervisor' },
          message: `${ username } has connected`,
          type: MessageType.system,
          ts: new Date()
        });
      }
    }

    this.connectionsSubject.next(this.connections);
  }

  // Connection handlers
  public onConnectionClose = (remotePeerId: string) =>
    () => {
      const { username } = this.connections[ remotePeerId ];
      this.connections[ remotePeerId ].streams.forEach(({ stream }) => stream.getTracks().forEach(track => track.stop()));
      this.connections[ remotePeerId ].calls.forEach(call => call.close());
      this.connections[ remotePeerId ].dataConnection.close();

      // Send 'X has disconnected' chat message only
      // if the remote peer had an ongoing media call
      if (this.connections[ remotePeerId ].streams.length > 0) {
        this.chatService.newMessage({
          from: { peerId: 'system', username: 'System' },
          to: { peerId: this.peerId, username: 'Supervisor' },
          message: `${ username } has disconnected`,
          type: MessageType.system,
          ts: new Date()
        });
      }

      delete this.connections[ remotePeerId ];
      this.connectionsSubject.next(this.connections);
    }

  public onConnectionData = (remotePeerId: string) =>
    (data) => {
      const { type, payload } = Message.parse(data);

      switch (type) {
        case Events.setName: {
          const { username } = payload as SetupPeerInformation;
          this.connections[ remotePeerId ].username = username;
          break;
        }

        case Events.chatMessage: {
          const { from, to, message, ts } = payload as ChatMessage;

          // Bad receiver
          if (to.peerId !== this.peerId) return;

          // Bad sender
          if (!this.connections[ from.peerId ]) {
            console.log(`Message from unknown peer (${ from.peerId })`);
            return;
          }

          this.chatService.newMessage({
            from, to, message,
            ts, type: MessageType.chat
          });
          break;
        }
      }
  }

  public broadcastChatMessage(chatMessage: string) {
    for (const remotePeerId in this.connections) {
      if (this.connections.hasOwnProperty(remotePeerId)) {

        const { username, dataConnection } = this.connections[ remotePeerId ];
        dataConnection?.send(Message.create({
          type: Events.chatMessage,
          payload: {
            from: { peerId: this.peerId, username: 'Supervisor' },
            to: { peerId: remotePeerId, username },
            message: chatMessage,
            type: MessageType.broadcast,
            ts: new Date()
          }
        }));
      }
    }
  }

  public sendChatMessage(peerId: string, chatMessage) {
    const { username, dataConnection } = this.connections[ peerId ];

    dataConnection?.send(
      Message.create({
        type: Events.chatMessage,
        payload: {
          from: { peerId: this.peerId, username: 'Supervisor' },
          to: { peerId, username },
          message: chatMessage,
          type: MessageType.chat,
          ts: new Date()
        }
      })
    );
  }

  public requestScreenStream(peerId: string) {
    if (!this.connections[ peerId ]) return;

    this.connections[ peerId ]
      .dataConnection
      .send(Message.create({
        type: Events.streamToggle,
        payload: {
          from: this.peerId,
          toggle: true,
          stream: { user: false, screen: true }
        }
      }))
  }

  public toggleStreams(peerIds: string[], options: StreamOptions, toggle: boolean) {
    peerIds.forEach(peerId => {
      this.connections[ peerId ]
        .dataConnection
        .send(Message.create({
          type: Events.streamToggle,
          payload: {
            from: this.peerId,
            stream: options,
            toggle
          }
        }))
    });
  }
}
