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
}
