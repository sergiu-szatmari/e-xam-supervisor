import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MediaService } from '../../shared/services/media.service';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from '../../shared/services/chat.service';
import { RoomPeerService } from '../../shared/services/room-peer.service';
import { ChatMessage, MessageType } from '../../shared/models/message';
import { StreamType } from '../../shared/models/stream';
import { SharedEventsService } from '../../shared/services/shared-events.service';

enum RoomState {
  idle = 'idle',
  call = 'call',
  endedCall = 'endedCall',
}

@UntilDestroy()
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  @ViewChild('messagesBox')
  messagesBox: ElementRef;

  chatMessage = '';
  attendeeName = '';
  roomId: string;

  roomStateSubject = new BehaviorSubject(RoomState.idle);
  public get roomState$() { return this.roomStateSubject.asObservable(); }

  // UI Utils
  chatMessages: ChatMessage[] = [ ];
  MessageType = MessageType;
  RoomState = RoomState;
  isLoadingBtn = false;

  constructor(
    protected toastr: NbToastrService,
    protected sharedEvents: SharedEventsService,
    public peerService: RoomPeerService,
    public mediaService: MediaService,
    public chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.chatService.chatMessages$
      .pipe(untilDestroyed(this))
      .subscribe((chatMessages) => {
        this.chatMessages = chatMessages;
        this.scrollToBottom();
      });

    this.sharedEvents.connected$
      .pipe(untilDestroyed(this))
      .subscribe(async (connected: boolean) => {
        if (connected) {
          await this.mediaService.loadStreams();
          // const { user, screen } = await this.mediaService.getStreams();

          // Initiate both webcam & screenShare media connections
          this.peerService.initiateCall(this.mediaService.remoteWebcamStream, StreamType.user);
          this.peerService.initiateCall(this.mediaService.remoteScreenStream, StreamType.screen);

          // "Mute" the video & audio tracks
          // for the screenSharing stream
          this.mediaService.remoteScreenStream.getTracks().forEach(track => track.enabled = false);

          this.isLoadingBtn = false;
          this.roomStateSubject.next(RoomState.call);
        }
      });

    this.sharedEvents
      .disconnectRequest$
      .pipe(untilDestroyed(this))
      .subscribe(disconnect => {
        if (disconnect) this.onLeaveRoom();
      })
  }

  public ngOnDestroy(): void {
    this.mediaService.closeStreams();
    this.roomStateSubject.next(RoomState.idle);
  }

  public onAttendeeNameType(name: string) {
    const capitalize = (text) => `${ text.charAt(0).toUpperCase() }${ text.slice(1).toLowerCase() }`;

    this.attendeeName = name
      .trim()
      .split(/\s/)
      .map(capitalize)
      .map(namePart => namePart.split('-').map(capitalize).join('-'))
      .join(' ');
  }

  public async onJoinRoom() {
    if (!this.attendeeName) {
      this.toastr.danger('Your name is required');
      return;
    }

    if (!this.roomId) {
      this.toastr.danger('No Room ID provided');
      return;
    }

    this.isLoadingBtn = true;
    this.peerService.connect(this.roomId, this.attendeeName);
  }

  public onLeaveRoom() {
    if (this.peerService.disconnect()) {
      // If peer disconnects successfully
      // (peer exists before, was connected, etc)
      this.peerService.disconnect();
      this.roomStateSubject.next(RoomState.endedCall);
      this.chatService.clear();
    }

    this.mediaService.closeStreams();
  }

  public onSendChatMessage() {
    if (this.chatMessage === '') return;

    this.chatService.newMessage({
      from: { peerId: this.peerService.peerId, username: this.attendeeName },
      to: { peerId: this.roomId, username: 'Supervisor' },
      message: this.chatMessage,
      type: MessageType.chat,
      ts: new Date(),
    });

    this.peerService.sendChatMessage(this.chatMessage);
    this.scrollToBottom();
    this.chatMessage = '';
  }

  public scrollToBottom() {
    const scroll = () => {
      const top = this.messagesBox.nativeElement.scrollHeight;
      this.messagesBox.nativeElement.scroll({ top, behaviour: 'smooth' });
    };

    if (this.messagesBox) setTimeout(scroll, 1);
  }
}
