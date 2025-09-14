import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';

export interface Mention {
  userId: string;
  username: string;
  startIndex: number;
  endIndex: number;
}

@Injectable()
export class MentionsService {
  constructor(private prisma: PrismaService) {}

  extractMentions(text: string): Mention[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: Mention[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push({
        userId: '', // Will be resolved later
        username: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return mentions;
  }

  async resolveMentions(mentions: Mention[], roomId: string): Promise<Mention[]> {
    if (mentions.length === 0) return [];

    const usernames = mentions.map(m => m.username);
    
    // Find users by their artist names in the room
    const users = await this.prisma.user.findMany({
      where: {
        artistProfile: {
          artistName: {
            in: usernames,
            mode: 'insensitive',
          },
        },
        roomMemberships: {
          some: {
            roomId,
          },
        },
      },
      include: {
        artistProfile: {
          select: {
            artistName: true,
          },
        },
      },
    });

    // Also try to match by email (username part before @)
    const emailUsers = await this.prisma.user.findMany({
      where: {
        OR: usernames.map(username => ({
          email: {
            startsWith: `${username}@`,
          },
        })),
        roomMemberships: {
          some: {
            roomId,
          },
        },
      },
    });

    // Resolve mentions with actual user IDs
    return mentions.map(mention => {
      const user = users.find(u => 
        u.artistProfile?.artistName.toLowerCase() === mention.username.toLowerCase()
      ) || emailUsers.find(u => 
        u.email.toLowerCase().startsWith(`${mention.username.toLowerCase()}@`)
      );

      return {
        ...mention,
        userId: user?.id || '',
      };
    }).filter(mention => mention.userId); // Only return valid mentions
  }

  async createNotifications(
    mentionedUserIds: string[],
    messageId: string,
    senderId: string,
    roomId: string,
  ): Promise<void> {
    if (mentionedUserIds.length === 0) return;

    // Create in-app notifications
    const notifications = mentionedUserIds.map(userId => ({
      id: crypto.randomUUID(),
      userId,
      type: 'MENTION',
      title: 'You were mentioned',
      message: 'Someone mentioned you in a chat',
      data: JSON.stringify({
        messageId,
        senderId,
        roomId,
      }),
      createdAt: new Date(),
      readAt: null,
    }));

    // Note: You'll need to create a Notification model in your schema
    // For now, we'll store it in a simple way
    // await this.prisma.notification.createMany({
    //   data: notifications,
    // });

    // TODO: Implement push notifications or email notifications
    // if the user has enabled them in their preferences
  }

  formatMessageWithMentions(text: string, mentions: Mention[]): string {
    if (mentions.length === 0) return text;

    let formattedText = text;
    let offset = 0;

    // Sort mentions by start index to process them in order
    const sortedMentions = [...mentions].sort((a, b) => a.startIndex - b.startIndex);

    for (const mention of sortedMentions) {
      const start = mention.startIndex + offset;
      const end = mention.endIndex + offset;
      const mentionText = `@${mention.username}`;
      const formattedMention = `<@${mention.userId}>`;

      formattedText = 
        formattedText.slice(0, start) + 
        formattedMention + 
        formattedText.slice(end);

      offset += formattedMention.length - mentionText.length;
    }

    return formattedText;
  }

  parseMentionsFromFormatted(text: string): string[] {
    const mentionRegex = /<@([^>]+)>/g;
    const userIds: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      userIds.push(match[1]);
    }

    return userIds;
  }
}