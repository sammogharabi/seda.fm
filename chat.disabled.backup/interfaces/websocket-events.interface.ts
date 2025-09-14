import { MessageEntity, ReactionEntity } from '../entities/message.entity';

export interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (data: {
    roomId: string;
    text: string;
    trackRef?: any;
    parentId?: string;
  }) => void;
  add_reaction: (data: {
    messageId: string;
    emoji: string;
  }) => void;
  remove_reaction: (data: {
    messageId: string;
    emoji: string;
  }) => void;
  typing_start: (roomId: string) => void;
  typing_stop: (roomId: string) => void;
}

export interface ServerToClientEvents {
  message_created: (message: MessageEntity) => void;
  message_deleted: (messageId: string, roomId: string) => void;
  reaction_added: (reaction: ReactionEntity) => void;
  reaction_removed: (messageId: string, userId: string, emoji: string) => void;
  user_typing: (roomId: string, userId: string, isTyping: boolean) => void;
  user_joined: (roomId: string, userId: string) => void;
  user_left: (roomId: string, userId: string) => void;
  user_muted: (roomId: string, userId: string, mutedUntil: Date) => void;
  error: (message: string, code?: string) => void;
}