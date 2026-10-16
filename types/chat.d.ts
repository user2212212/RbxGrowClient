export interface ChatUser {
  _id: string;
  username?: string;
  avatar?: string;
  ranks?: string[];
  anonymous: boolean;
}

export interface ChatMessage {
  _id: string;
  user: ChatUser;
  content: string;
  channel: string;
  replyTo: {
    _id: string;
    user: ChatUser;
    content: string;
    channel: string;
    edited: boolean;
    sentAt: string;
  } | null;
  edited: boolean;
  sentAt: string;
}

export interface ChatRank {
  _id: string;
}

export interface ChatEmoji {
  id: string;
  name: string;
  url: string;
  animated: boolean;
  identifier: string;
}