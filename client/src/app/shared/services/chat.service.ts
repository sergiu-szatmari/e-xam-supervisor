import { Injectable } from '@angular/core';
import { ChatMessage } from '../models/message';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatMessages: ChatMessage[] = [ ];
  private chatMessageSubject = new BehaviorSubject([]);
  public get chatMessages$() { return this.chatMessageSubject.asObservable(); }

  constructor() { }

  public newMessage(message: ChatMessage) {
    // TODO: Validate chat message
    this.chatMessages.push(message);
    this.chatMessageSubject.next(this.chatMessages);
  }

  public clear() {
    this.chatMessages = [];
    this.chatMessageSubject.next(this.chatMessages);
  }

  public exportToCsv() {
    if (this.chatMessages.length === 1) return;

    const delimiter = { column: ',', line: '\n' };
    const keys = [ 'From (Username)', 'From (Peer ID)', 'To (Username)', 'To (Peer ID)', 'Message', 'Message type', 'Timestamp' ];
    let fileContent = keys.join(delimiter.column) + delimiter.line;
    fileContent += this.chatMessages
        .map(chatMessage => [
          chatMessage.from?.username || '-',
          chatMessage.from?.peerId || '-',
          chatMessage.to?.username || '-',
          chatMessage.to?.peerId || '-',
          chatMessage.message || '-',
          chatMessage.type || '-',
          chatMessage.ts || '-',
        ])
        .map(item => item.join(delimiter.column))
        .join(delimiter.line);

    return new Blob([ fileContent ], { type: 'text/csv' });
  }
}
