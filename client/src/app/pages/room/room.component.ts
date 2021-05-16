import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import 'webrtc-adapter';
import { environment } from '../../../environments/environment';
import Peer, { DataConnection, MediaConnection, PeerJSOption } from 'peerjs';
import { Events } from '../../shared/models/events';
import { ChatMessage, Message, MessageType } from '../../shared/models/message';
import { PeerService } from '../../shared/services/peer.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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

  userStream: MediaStream;
  screenStream: MediaStream;

  chatMessage = '';
  chatMessages: ChatMessage[] = [];
  attendeeName = '';
  roomId: string;

  calls: MediaConnection[];
  peer: Peer;
  peerId: string;
  connection: DataConnection;

  @ViewChild('user')
  userVideoElem: ElementRef;

  @ViewChild('screen')
  screenVideoElem: ElementRef;

  roomState: RoomState = RoomState.idle;
  isSharing: boolean;
  isInCall = false;

  // UI Utils
  MessageType = MessageType;
  RoomState = RoomState;

  constructor(
    protected peerService: PeerService,
    protected toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.peerService
      .leaveRoom$
      .pipe(untilDestroyed(this))
      .subscribe(disconnect => {
        if (disconnect) this.onLeaveRoom();
      })
  }

  public ngOnDestroy(): void {
    this.onStopSharing();
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

  private async loadStream() {
    try {
      const [ userStream, screenStream ] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }),

        // @ts-ignore
        navigator.mediaDevices.getDisplayMedia({ audio: true, video: { deviceId: 1 } }),
      ]);

      this.userStream = userStream;
      this.screenStream = screenStream;

      this.userVideoElem.nativeElement.srcObject = userStream;
      this.screenVideoElem.nativeElement.srcObject = screenStream;

      this.isSharing = true;
    } catch (err) {
      console.error(err);
      this.toastr.danger(err.message);
    }
  }

  public onToggleSharing() {
    [
      ...(this.userStream.getTracks()),
      ...(this.screenStream.getTracks())
    ].forEach(track => track.enabled = !track.enabled);
    this.isSharing = !this.isSharing;
  }

  public onStopSharing() {
    this.userStream?.getTracks()?.forEach(track => track.stop());
    this.screenStream?.getTracks()?.forEach(track => track.stop());

    this.userStream = null;
    this.screenStream = null;
  }

  public onJoinRoom() {
    const { url, path, port } = environment.server;
    const peerOptions: PeerJSOption = {
      host: url,
      debug: 1,
      path,
      port,
    };

    this.peer = new Peer(peerOptions);
    this.peer.on('open', () => {
      this.peerId = this.peer.id;
      this.connection = this.peer.connect(this.roomId);
      this.chatMessages.push({
        from: 'system', username: 'System',
        message: 'You connected',
        type: MessageType.system,
        ts: new Date()
      });

      this.connection.on('data', (data) => {
        const { type, payload } = Message.parse(data);

        switch (type) {
          case Events.chatMessage:
            const { username, message, ts } = payload as ChatMessage;
            const chatMessageType = (payload as ChatMessage).type;
            this.chatMessages.push({ username, message, ts, from: 'supervisor', type: chatMessageType });
            break;
        }
      });

      this.connection.on('open', async () => {

        this.peerService.connected = true;
        // Sending username
        const message = Message.create({
          type: Events.setName,
          payload: { username: this.attendeeName }
        });
        this.connection.send(message);

        this.roomState = RoomState.call;

        await this.loadStream();

        this.calls = [ this.userStream ] // , this.screenStream ]
          .map(stream => stream.clone())
          .map(streamClone => this.peer.call(this.roomId, streamClone));
      })
    });
  }

  public onLeaveRoom() {
    this.calls.forEach(call => call.close());
    this.peer.destroy();
    this.onStopSharing();

    this.roomState = RoomState.endedCall;
    this.isInCall = false;
    this.peerId = '';
    this.chatMessages = [];
    this.peer = null;

    this.peerService.connected = false;
  }

  public onSendChatMessage() {
    this.chatMessages.push({
      from: 'me',
      username: this.attendeeName,
      message: this.chatMessage,
      type: MessageType.chat,
      ts: new Date(),
    });

    const chatMessage = Message.create({
      type: Events.chatMessage,
      payload: {
        from: this.peerId,
        username: this.attendeeName,
        message: this.chatMessage,
        type: MessageType.chat,
        ts: new Date()
      }
    });
    this.connection.send(chatMessage);
    this.chatMessage = '';
  }
}
