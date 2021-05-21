import { Injectable } from '@angular/core';
import { PeerService } from './peer.service';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { ChatService } from './chat.service';
import { environment } from '../../../environments/environment';
import { ChatMessage, Message, MessageType, SetupPeerInformation } from '../models/message';
import { Events } from '../models/events';
import { BehaviorSubject } from 'rxjs';
import { PeerConnections } from '../models/peer-connections';

@Injectable({
  providedIn: 'root'
})
export class SupervisorPeerService extends PeerService {

  protected peer: Peer;
  public peerId: string;

  public connections: PeerConnections = { };
  private connectionsSubject = new BehaviorSubject(this.connections);
  public get connections$() { return this.connectionsSubject.asObservable(); }

  constructor(protected chatService: ChatService) {
    super();
  }

  public connect() {
    const { url, path, port } = environment.server;
    const secure = environment.production;

    this.peer = new Peer({
      path, port, secure,
      host: url, debug: 1,
    });
    console.log('Peer created');

    this.peer.on('open', this.onPeerOpen);
    this.peer.on('connection', this.onPeerConnection);
    this.peer.on('call', this.onPeerCall);

    console.log(`Room created`);
  }

  public disconnect(): boolean {
    if (Object.keys(this.connections).length > 0) throw new Error('You cannot disconnect while attendees are still connected.');
    if (!this.peer || !this.peerId) return false;

    this.peer.disconnect()
    this.peer.destroy();
    this.peer = null;
    this.peerId = null;
    this.connectedSubject.next(false);
    return true;
  }

  public onPeerOpen = () => {
    this.peerId = this.peer.id;
    console.log(`(${ this.peerId })`);

    this.connectedSubject.next(true);

    this.chatService.newMessage({
      from: 'system', username: 'System',
      message: 'You connected',
      type: MessageType.system,
      ts: new Date()
    });
  }

  public onPeerConnection = (connection: DataConnection) => {
    console.log(`onConnection`);

    if (!this.connections[ connection.peer ]) {
      this.connections[ connection.peer ] = {
        dataConnection: connection,
        streams: [],
        calls: []
      };

      console.log(this.connections);
      this.connectionsSubject.next(this.connections);
    }
    connection.on('close', this.onConnectionClose(connection.peer));

    connection.on('data', this.onConnectionData(connection.peer));

    //   // Add initial empty connection object
    //   // if peer is was not connected before
    //   if (!this.connections[ connection.peer ]) {
    //     this.connections[ connection.peer ] = { peerData: { }, connections: [], connection };
    //   }
  }

  public onPeerCall = (call: MediaConnection) => {
    console.log('onPeerCall');

    const remotePeerId = call.peer;

    call.on('error', (err) => { console.error(`Call error`, err); })
    call.on('stream', (remoteStream) => {
      if (this.connections[ remotePeerId ]
        .streams
        .find(stream => stream.id === remoteStream.id)) return;

      this.connections[ remotePeerId ].streams.push(remoteStream);
      this.connectionsSubject.next(this.connections);
      // const peerConnection = this.connections[ peer ];
      // if (!peerConnection) {
      //   // Added connection with peer if it does not exits
      //   this.connections[ peer ].connections.push({ connectionId: call.connectionId, stream: remoteStream });
      //   return;
      // }
      //
      // // Connection with peer already exists
      // const connection = peerConnection.connections.find((conn) => conn.connectionId === call.connectionId);
      // if (!connection) {
      //   // Current remoteStream was not sent before
      //   peerConnection.connections.push({ connectionId: call.connectionId, stream: remoteStream })
      // } else {
      //   // Set the current remoteStream if the
      //   // connection exists but the stream doesn't
      //   connection.stream = connection.stream || remoteStream;
      // }
    });

    call.answer();

    if (this.connections[ remotePeerId ]) {
      this.connections[ remotePeerId ].calls.push(call);
    }

    this.connectionsSubject.next(this.connections);
    console.log(`Call answered`, { connections: this.connections });
  }

  // Connection handlers
  public onConnectionClose = (remotePeerId: string) =>
    () => {
    const username = this.connections[ remotePeerId ].username;
    this.connections[ remotePeerId ].streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
    this.connections[ remotePeerId ].calls.forEach(call => call.close());
    this.connections[ remotePeerId ].dataConnection.close();
    delete this.connections[ remotePeerId ];

    this.chatService.newMessage({
      from: 'system', username: 'System',
      message: `${ username } has disconnected`,
      type: MessageType.system,
      ts: new Date()
    });
    this.connectionsSubject.next(this.connections);
    }

  public onConnectionData = (remotePeerId: string) =>
    (data) => {
      const { type, payload } = Message.parse(data);

      switch (type) {
        case Events.setName: {
          const { username } = payload as SetupPeerInformation;
          this.connections[ remotePeerId ].username = username;

          this.chatService.newMessage({
            from: 'system',
            username: 'System',
            message: `${ username } has connected`,
            type: MessageType.system,
            ts: new Date()
          });
          break;
        }

        case Events.chatMessage: {
          const { from, username, message, ts } = payload as ChatMessage;
          if (!this.connections[ from ]) {
            console.log(`Message from unknown peer (${ from })`);
            return;
          }

          this.chatService.newMessage({ from, username, message, ts, type: MessageType.chat });
          break;
        }
      }
  }

  public broadcastChatMessage(chatMessage: string) {
    // tslint:disable-next-line:forin
    for (const remotePeerId in this.connections) {
      // const dataConnection = this.peer.connections[ remotePeerId ]
      //   .find(connection => connection.type === 'data');
      const dataConnection = this.connections[ remotePeerId ].dataConnection;
      dataConnection?.send(Message.create({
        type: Events.chatMessage,
        payload: {
          from: this.peerId,
          username: 'Supervisor',
          message: chatMessage,
          type: MessageType.broadcast,
          ts: new Date()
        }
      }));
    }
  }
}
