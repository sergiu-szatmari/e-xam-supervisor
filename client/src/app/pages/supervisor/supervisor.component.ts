import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageType } from '../../shared/models/message';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SupervisorPeerService } from '../../shared/services/supervisor-peer.service';
import { MediaService } from '../../shared/services/media.service';
import { ChatService } from '../../shared/services/chat.service';
import { PeerConnections } from '../../shared/models/peer-connections';
import { NbToastrService } from '@nebular/theme';
import { StreamType } from '../../shared/models/stream';

enum RoomView {
  grid = 'grid',
  focused = 'focused'
}

@UntilDestroy()
@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.scss']
})
export class SupervisorComponent implements OnInit, OnDestroy {

  broadcastChatMessage = '';

  streams: { peerId: string, username: string; stream: MediaStream }[] = [];

  // Focused mode
  userStream: MediaStream;
  screenStream: MediaStream;
  focusedRemotePeerId: string;

  // UI Utils
  RoomView = RoomView;
  roomView: RoomView = RoomView.grid;
  copiedToClipBoard = false;

  constructor(
    protected mediaService: MediaService,
    protected toastr: NbToastrService,
    public chatService: ChatService,
    public peerService: SupervisorPeerService,
  ) { }

  ngOnInit(): void {
    this.peerService.connected$
      .pipe(untilDestroyed(this))
      .subscribe(async (connected) => {
        if (!connected) this.onLeaveRoom();
      })

    this.mediaService
      .disconnectRequest$
      .pipe(untilDestroyed(this))
      .subscribe(disconnect => {
        if (disconnect) this.onLeaveRoom();
      });

    this.mediaService
      .backToGridViewRequest$
      .pipe(untilDestroyed(this))
      .subscribe(backToGrid => {
        if (backToGrid) this.onBackToGrid();
      });

    this.peerService.connections$
      .pipe(untilDestroyed(this))
      .subscribe((connections: PeerConnections) => {
        const streams = [];

        Object.keys(connections)
          .forEach(remotePeerId => {
            connections[ remotePeerId ]
              .streams
              .forEach(({ type, stream }) => {
                if (type === StreamType.user) {
                  streams.push({
                    username: connections[ remotePeerId ].username || 'Unnamed user',
                    stream, peerId: remotePeerId,
                  });
                }
              });
          });

        this.streams = streams;
      });
  }

  public ngOnDestroy(): void {
    this.onLeaveRoom();
  }

  public onCreateRoom() {
    this.peerService.connect();
    this.mediaService.streaming = true;
  }

  public onCopyToClipBoard() {
    if (this.copiedToClipBoard) return;

    const text = document.createElement('textarea');
    text.style.opacity = '0';
    text.value = this.peerService.peerId;

    document.body.appendChild(text);
    text.focus()
    text.select();
    document.execCommand('copy');
    document.body.removeChild(text);

    this.copiedToClipBoard = true;
    setTimeout(() => this.copiedToClipBoard = false, 1200);
  }

  public onBroadcastChatMessage() {
    this.chatService.newMessage({
      from: 'supervisor',
      username: 'Supervisor',
      message: this.broadcastChatMessage,
      type: MessageType.broadcast,
      ts: new Date()
    });

    this.peerService.broadcastChatMessage(this.broadcastChatMessage);
    this.broadcastChatMessage = '';
  }

  public onLeaveRoom() {
    try {
      this.peerService.disconnect();
      this.mediaService.streaming = false;
    } catch (err) {
      this.toastr.danger(err.message);
    }
  }

  public onFocusMode(remotePeerId: string) {
    for (const peerId in this.peerService.connections) {
      if (peerId === remotePeerId) continue;

      this.peerService.connections[ peerId ]
        .streams
        .forEach(({ type, stream }) => {
          if (type === StreamType.user) stream.getTracks().forEach(track => track.enabled = false)
        })
    }

    if (this.peerService.connections[ remotePeerId ].streams.length < 2) {
      // Request "Screen" stream to peer
      // if wasn't requested before
      this.peerService.requestScreenStream(remotePeerId);
    }


    console.log(this.peerService.connections);

    setTimeout(() => {
      this.peerService
        .connections[ remotePeerId ]
        .streams
        .find(({ type }) => type === StreamType.screen)
        .stream
        .getTracks()
        .forEach(track => track.enabled = true);

      this.userStream = this.peerService
        .connections[ remotePeerId ]
        .streams
        .find(({ type }) => type === StreamType.user)
        .stream;

      this.screenStream = this.peerService
        .connections[ remotePeerId ]
        .streams
        .find(({ type }) => type === StreamType.screen)
        .stream;

      this.focusedRemotePeerId = remotePeerId;
      this.roomView = RoomView.focused;
      this.mediaService.focusedView = true;
    }, 500);
  }

  public onBackToGrid() {
    this.peerService.connections[ this.focusedRemotePeerId ]
      .streams
      .find(({ type }) => type === StreamType.screen)
      .stream
      .getTracks()
      .forEach(track => {
        track.enabled = false;
      });

    for (const peerId in this.peerService.connections) {
      if (peerId === this.focusedRemotePeerId) continue;

      this.peerService.connections[ peerId ]
        .streams
        .find(({ type }) => type === StreamType.user)
        .stream
        .getTracks()
        .forEach(track => {
          track.enabled = true;
        });
    }
    // this.peerService.sendStreamToggleMessage(this.focusedRemotePeerId, false, { user: false, screen: true });
    // this.peerService.sendStreamToggleBroadcast(true, { user: true, screen: false }, [ this.focusedRemotePeerId ]);

    setTimeout(() => {
      this.focusedRemotePeerId = null;
      this.roomView = RoomView.grid;
      this.mediaService.focusedView = false;
      this.userStream = null;
      this.screenStream = null;
    }, 500);
  }
}
