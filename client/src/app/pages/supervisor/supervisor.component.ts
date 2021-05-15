import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import Peer, { PeerJSOption } from 'peerjs';

type PeerConnectionObject = { id: string, peerId: string, streams: MediaStream[] };

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.scss']
})
export class SupervisorComponent implements OnInit {

  peerId: string;
  peer;

  connections: {
    [peerId: string]: {
      peerData: { name?: string },
      connections: { stream?: MediaStream, connectionId: string }[],
    }
  } = { };

  // UI Utils
  copiedToClipBoard = false;

  constructor() { }

  ngOnInit(): void {
  }

  public onCreateRoom() {
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
    });

    this.peer.on('connection', (connection) => {

      connection.on('close', () => {
        if (this.connections[ connection.peer ]) {
          delete this.connections[ connection.peer ];
        }
      });

      connection.on('data', (data) => {
        const { type, payload } = JSON.parse(data) as { type: string, payload: any };

        switch (type) {
          case 'set-name':
            const { attendeeName } = payload as { attendeeName: string };
            peerConnection.peerData.name = attendeeName;
            break;
        }
      });

      let peerConnection = this.connections[ connection.peer ];
      if (!peerConnection) {
        // Add initial empty connection object
        // if peer is was not connected before
        this.connections[ connection.peer ] = { peerData: { }, connections: [] };
        peerConnection = this.connections[ connection.peer ];
      }
    });

    this.peer.on('call', (call) => {

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
        this.connections[ peer ] = { peerData: {}, connections: [ { connectionId: call.connectionId }] };
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
}
