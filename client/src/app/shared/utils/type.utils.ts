import { ChatMessage, SetupPeerInformation } from '../models/message';

export class TypeGuards {
  public static isSetupPeerInformation(obj: any): obj is SetupPeerInformation {
    return (obj as SetupPeerInformation).username !== undefined;
  }

  public static isChatMessage(obj: any): obj is ChatMessage {
    return (obj as ChatMessage).message !== undefined &&
      (obj as ChatMessage).from !== undefined &&
      (obj as ChatMessage).type !== undefined &&
      (obj as ChatMessage).username !== undefined &&
      (obj as ChatMessage).ts !== undefined;
  }
}
