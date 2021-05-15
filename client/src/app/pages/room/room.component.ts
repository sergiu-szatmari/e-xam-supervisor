import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import 'webrtc-adapter';
import { environment } from '../../../environments/environment';
import Peer, { MediaConnection, PeerJSOption } from 'peerjs';

enum RoomState {
  idle = 'idle',
  call = 'call',
  endedCall = 'endedCall',
}

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  userStream: MediaStream;
  screenStream: MediaStream;

  attendeeName = '';
  roomId: string;

  calls: MediaConnection[];
  peer: Peer;
  peerId;

  @ViewChild('user')
  userVideoElem: ElementRef;

  @ViewChild('screen')
  screenVideoElem: ElementRef;

  roomState: RoomState = RoomState.idle;
  isSharing: boolean;
  isInCall = false;

  // UI Utils
  RoomState = RoomState;

  constructor(
    protected toastr: NbToastrService
  ) { }

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.onStopSharing();
  }

  public onAttendeeNameType(name: string) {
    const capitalize = (text) => `${ text.charAt(0).toUpperCase() }${ text.slice(1).toLowerCase() }`;

    this.attendeeName = name
      .split(/\s/)
      .map(capitalize)
      .map(namePart => namePart.split('-').map(capitalize).join('-'))
      .join(' ');
  }

  private async loadStream() {
    try {
      const [ userStream, screenStream ] = await Promise.all([
        // TODO: See "MediaTrackConstraintSet"
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }),

        // @ts-ignore
        navigator.mediaDevices.getDisplayMedia({ audio: true, video: { deviceId: 1 } }),
      ]);

      console.log({ userStream });
      console.log({ screenStream });

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

      const connection = this.peer.connect(this.roomId);
      connection.on('open', async () => {
        // Sending username
        connection.send(JSON.stringify({
          type: 'set-name',
          payload: {
            attendeeName: this.attendeeName
          }
        }));

        this.roomState = RoomState.call;

        await this.loadStream();

        const call1 = this.peer.call(this.roomId, this.userStream.clone());
        const call2 = this.peer.call(this.roomId, this.screenStream.clone());
        console.log({ call1, call2 });
        this.calls = [ call1, call2 ];
      })
    });
  }

  public onLeaveRoom() {
    this.calls.forEach(call => call.close());
    this.peer.destroy();
    this.onStopSharing();

    this.roomState = RoomState.endedCall;
  }
}
