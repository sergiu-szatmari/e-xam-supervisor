import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import Peer, { DataConnection, MediaConnection, PeerJSOption } from 'peerjs';
import { Events } from '../../shared/models/events';
import { ChatMessage, Message, MessageType, SetupPeerInformation } from '../../shared/models/message';
import { OldPeerService } from '../../shared/services/old-peer.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

type PeerConnectionObject = { id: string, peerId: string, streams: MediaStream[] };

@UntilDestroy()
@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.scss']
})
export class SupervisorComponent implements OnInit, OnDestroy {

  chatMessages: ChatMessage[] = [];
  broadcastChatMessage = '';

  peerId: string;
  peer;

  // TODO: See Peer.connections (index.d.ts)
  connections: {
    [peerId: string]: {
      peerData: { name?: string },
      connections: { stream?: MediaStream, connectionId: string }[],
      connection?: DataConnection
    }
  } = { };

  // TODO: Merge in "connections"
  calls: MediaConnection[] = [];

  // UI Utils
  copiedToClipBoard = false;

  constructor(
    protected peerService: OldPeerService
  ) { }

  ngOnInit(): void {
    this.peerService
      .leaveRoom$
      .pipe(untilDestroyed(this))
      .subscribe((disconnect) => {
        if (disconnect) this.onLeaveRoom();
      })
  }

  public ngOnDestroy(): void {
    if (this.peerId) this.onLeaveRoom();
  }

  public onCreateRoom() {
    const { url, path, port } = environment.server;
    const secure = environment.production;
    const peerOptions: PeerJSOption = {
      host: url,
      debug: 1,
      path,
      port,
      secure
    };

    this.peer = new Peer(peerOptions);
    this.peer.on('open', () => {
      this.peerId = this.peer.id;
      this.peerService.connected = true;
      this.chatMessages.push({
        from: 'system',
        username: 'System',
        message: 'You connected',
        type: MessageType.system,
        ts: new Date()
      });
    });

    this.peer.on('connection', (connection) => {

      connection.on('close', () => {
        if (this.connections[ connection.peer ]) {
          this.chatMessages.push({
            from: 'system', username: 'System',
            message: `${ this.connections[ connection.peer ].peerData.name } has disconnected`,
            type: MessageType.system,
            ts: new Date()
          });
          delete this.connections[ connection.peer ];
        }
      });

      connection.on('data', (data) => {
        const { type, payload } = Message.parse(data);

        switch (type) {
          case Events.setName: {
            const { username } = payload as SetupPeerInformation;
            this.connections[ connection.peer ].peerData.name = username;
            this.chatMessages.push({
              from: 'system',
              username: 'System',
              message: `${ this.connections[ connection.peer ].peerData.name } has connected`,
              type: MessageType.system,
              ts: new Date()
            });
            break;
          }

          case Events.chatMessage: {
            const { from, username, message, ts } = payload as ChatMessage;
            if (!this.connections[ from ]) return;

            this.chatMessages.push({ from, username, message, ts, type: MessageType.chat });
            break;
          }
        }
      });

      // Add initial empty connection object
      // if peer is was not connected before
      if (!this.connections[ connection.peer ]) {
        this.connections[ connection.peer ] = { peerData: { }, connections: [], connection };
      }
    });

    this.peer.on('call', (call) => {

      this.calls.push(call);

      call.on('stream', (remoteStream) => {
        const peerConnection = this.connections[ peer ];
        if (!peerConnection) {
          // Added connection with peer if it does not exits
          this.connections[ peer ].connections.push({ connectionId: call.connectionId, stream: remoteStream });
          return;
        }

        // Connection with peer already exists
        const connection = peerConnection.connections.find((conn) => conn.connectionId === call.connectionId);
        if (!connection) {
          // Current remoteStream was not sent before
          peerConnection.connections.push({ connectionId: call.connectionId, stream: remoteStream })
        } else {
          // Set the current remoteStream if the
          // connection exists but the stream doesn't
          connection.stream = connection.stream || remoteStream;
        }
      });

      const { peer } = call;
      const existingPeerConnection = this.connections[ peer ];
      if (!existingPeerConnection) {
        this.connections[ peer ] = {
          peerData: {},
          connections: [
            { connectionId: call.connectionId }
          ],
          // connection: this.connections[ peer ].connection || ?
        };
      }

      call.answer();
      console.log(`Call answered`, { connections: this.connections });
    })

    console.log('Room created');
  }

  public onCopyToClipBoard() {
    if (this.copiedToClipBoard) return;

    const text = document.createElement('textarea');
    text.style.opacity = '0';
    text.value = this.peerId;

    document.body.appendChild(text);
    text.focus()
    text.select();
    document.execCommand('copy');
    document.body.removeChild(text);

    this.copiedToClipBoard = true;
  }

  public onBroadcastChatMessage() {
    this.chatMessages.push({
      from: 'supervisor',
      username: 'Supervisor',
      message: this.broadcastChatMessage,
      type: MessageType.broadcast,
      ts: new Date()
    });

    for (const peerId in this.connections) {
      if (this.connections[ peerId ]?.connection) {
        const message = Message.create({
          type: Events.chatMessage,
          payload: {
            from: this.peerId,
            username: 'Supervisor',
            message: this.broadcastChatMessage,
            type: MessageType.broadcast,
            ts: new Date()
          }
        });
        (this.connections[ peerId ].connection as DataConnection).send(message);
      }
    }

    this.broadcastChatMessage = '';
  }

  public onLeaveRoom() {
    // TODO: Send "close" event to all attendees ? / kick

    this.calls.forEach(call => call.close());
    this.peer.destroy();

    this.connections = { };
    this.chatMessages = [];
    this.peerId = '';
    this.peer = null;

    this.peerService.connected = false;
  }

  public onFocusMode() {
    alert('tba');
  }
}
