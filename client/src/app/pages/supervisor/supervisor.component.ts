import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageType } from '../../shared/models/message';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SupervisorPeerService } from '../../shared/services/supervisor-peer.service';
import { MediaService } from '../../shared/services/media.service';
import { ChatService } from '../../shared/services/chat.service';
import { PeerConnections } from '../../shared/models/peer-connections';
import { NbToastrService } from '@nebular/theme';

@UntilDestroy()
@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.scss']
})
export class SupervisorComponent implements OnInit, OnDestroy {

  broadcastChatMessage = '';

  streams: MediaStream[] = [];

  // UI Utils
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

    this.peerService.connections$
      .pipe(untilDestroyed(this))
      .subscribe((connections: PeerConnections) => {
        const streams = [];

        // tslint:disable-next-line:forin
        for (const remotePeerId in connections) {
          connections[ remotePeerId ].streams.forEach(stream => streams.push(stream));
        }
        this.streams = streams;
        console.log(`Streams --> `, this.streams);
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
      // TODO: Send "close" event to all attendees ? / kick
      this.mediaService.streaming = false;
    } catch (err) {
      this.toastr.danger(err.message);
    }
  }

  public onFocusMode() {
    alert('tba');
  }
}
