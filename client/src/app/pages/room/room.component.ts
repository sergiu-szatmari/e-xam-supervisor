import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import 'webrtc-adapter';
import { OldPeerService } from '../../shared/services/old-peer.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MediaService } from '../../shared/services/media.service';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from '../../shared/services/chat.service';
import { RoomPeerService } from '../../shared/services/room-peer.service';
import { MessageType } from '../../shared/models/message';

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

  chatMessage = '';
  attendeeName = '';
  roomId: string;

  webcamStream: MediaStream;
  screenStream: MediaStream;

  roomStateSubject = new BehaviorSubject(RoomState.idle);
  public get roomState$() { return this.roomStateSubject.asObservable(); }

  // UI Utils
  MessageType = MessageType;
  RoomState = RoomState;

  constructor(
    protected toastr: NbToastrService,
    public peerService: RoomPeerService,
    public mediaService: MediaService,
    public chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.peerService.connected$
      .pipe(untilDestroyed(this))
      .subscribe(async (connected: boolean) => {
        if (connected) {
          this.roomStateSubject.next(RoomState.call);

          const { user } = await this.mediaService.getStreamClone({ user: true, screen: false });
          this.peerService.initiateCall(user);
        }
      });

    this.mediaService
      .disconnectRequest$
      .pipe(untilDestroyed(this))
      .subscribe(disconnect => {
        if (disconnect) this.onLeaveRoom();
      })
  }

  public ngOnDestroy(): void {
    this.mediaService.closeStreams();
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

    this.peerService.connect(this.roomId, this.attendeeName);
  }

  public onLeaveRoom() {
    if (this.peerService.disconnect()) {
      // If peer disconnects successfully
      // (peer exists before, was connected, etc)
      this.peerService.disconnect();
      // this.oldPeerService.disconnect();

      this.roomStateSubject.next(RoomState.endedCall);
      this.chatService.clear();
    }

    this.mediaService.closeStreams();
  }

  public onSendChatMessage() {
    this.chatService.newMessage({
      from: 'me',
      username: this.attendeeName,
      message: this.chatMessage,
      type: MessageType.chat,
      ts: new Date(),
    });

    this.peerService.sendChatMessage(this.chatMessage);
    this.chatMessage = '';
  }
}
