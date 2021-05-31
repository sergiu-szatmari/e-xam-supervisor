import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatMessage, MessageType } from '../../shared/models/message';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SupervisorPeerService } from '../../shared/services/supervisor-peer.service';
import { ChatService } from '../../shared/services/chat.service';
import { PeerConnections } from '../../shared/models/peer-connections';
import { NbToastrService } from '@nebular/theme';
import { StreamType } from '../../shared/models/stream';
import { SharedEventsService } from '../../shared/services/shared-events.service';

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

  @ViewChild('messagesBox')
  messagesBox: ElementRef;

  chatMessage = '';

  chatMessages: ChatMessage[] = [ ];

  streams: { peerId: string, username: string; stream: MediaStream }[] = [];

  // Focused mode
  userStream: MediaStream;
  screenStream: MediaStream;
  focusedRemotePeerId: string;
  focusedRemotePeerUsername: string;

  // UI Utils
  MessageType = MessageType
  RoomView = RoomView;
  roomView: RoomView = RoomView.grid;
  copiedToClipBoard = null;

  constructor(
    protected toastr: NbToastrService,
    public sharedEvents: SharedEventsService,
    public chatService: ChatService,
    public peerService: SupervisorPeerService,
  ) { }

  ngOnInit(): void {
    this.chatService
      .chatMessages$
      .pipe(untilDestroyed(this))
      .subscribe((chatMessages) => {
        this.chatMessages = chatMessages;
        this.scrollToBottom();
      });

    this.sharedEvents
      .connected$
      .pipe(untilDestroyed(this))
      .subscribe(async (connected) => {
        if (!connected) this.onLeaveRoom();
      })

    // this.sharedEvents
    //   .disconnectRequest$
    //   .pipe(untilDestroyed(this))
    //   .subscribe(disconnect => {
    //     if (disconnect) this.onLeaveRoom();
    //   });

    this.sharedEvents
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
    this.sharedEvents.streaming = true;
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
    setTimeout(() => this.copiedToClipBoard = null, 2000);
  }

  public onSendChatMessage() {
    if (this.chatMessage === '') return;

    const message: ChatMessage = {
      from: { peerId: this.peerService.peerId, username: 'Supervisor', },
      message: this.chatMessage,
      type: this.focusedRemotePeerId ? MessageType.chat : MessageType.broadcast,
      ts: new Date()
    };

    if (this.focusedRemotePeerId) {
      message.to = { peerId: this.focusedRemotePeerId, username: this.focusedRemotePeerUsername };
    }

    this.chatService.newMessage(message);

    if (this.focusedRemotePeerId) {
      this.peerService.sendChatMessage(this.focusedRemotePeerId, this.chatMessage);
    } else {
      this.peerService.broadcastChatMessage(this.chatMessage);
    }

    this.scrollToBottom();
    this.chatMessage = '';
  }

  public onLeaveRoom() {
    try {
      this.peerService.disconnect();
      this.sharedEvents.streaming = false;
    } catch (err) {
      this.toastr.danger(err.message);
    }
  }

  public onFocusMode(remotePeerId: string) {
    this.peerService.toggleStreams(
      Object.keys(this.peerService.connections).filter(peerId => peerId !== remotePeerId),
      { user: true, screen: false },
      false
    );

    this.peerService.toggleStreams([ remotePeerId ], { user: false, screen: true }, true);

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
    this.focusedRemotePeerUsername = this.peerService.connections[ remotePeerId ].username;
    this.roomView = RoomView.focused;
    this.sharedEvents.focusedView = true;
  }

  public onBackToGrid() {
    this.peerService.toggleStreams([ this.focusedRemotePeerId ], { user: false, screen: true }, false);

    this.peerService.toggleStreams(
      Object.keys(this.peerService.connections).filter(peerId => peerId !== this.focusedRemotePeerId),
      { user: true, screen: false },
      true
    );

    setTimeout(() => {
      this.focusedRemotePeerId = null;
      this.focusedRemotePeerUsername = '';
      this.roomView = RoomView.grid;
      this.sharedEvents.focusedView = false;
      this.userStream = null;
      this.screenStream = null;
    }, 500);
  }

  public scrollToBottom() {
    const scroll = () => {
      const top = this.messagesBox.nativeElement.scrollHeight;
      this.messagesBox.nativeElement.scroll({ top, behaviour: 'smooth' });
    };

    if (this.messagesBox) setTimeout(scroll, 1);
  }
}
