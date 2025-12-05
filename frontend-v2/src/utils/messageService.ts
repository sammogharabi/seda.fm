// Simple messaging service for demo purposes
// In a real app, this would be replaced with backend API calls

export interface Message {
  id: string;
  fromUserId: string;
  fromUser: {
    id: string;
    username: string;
    displayName: string;
    accentColor: string;
    verified?: boolean;
    isArtist?: boolean;
  };
  toUserId: string;
  toUser?: {
    id: string;
    username: string;
    displayName: string;
    accentColor: string;
    verified?: boolean;
    isArtist?: boolean;
  };
  content: string;
  messageType: 'general' | 'collaboration' | 'support';
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  // Threading support
  parentMessageId?: string;
  replies?: Message[];
  conversationId: string; // Groups messages in the same conversation
}

const MESSAGES_STORAGE_KEY = 'seda_messages';

// Get all messages for a user
export const getUserMessages = (userId: string): Message[] => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!storedMessages) return [];
    
    const allMessages = JSON.parse(storedMessages);
    return allMessages
      .filter((msg: Message) => msg.toUserId === userId)
      .map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp) // Convert back to Date object
      }))
      .sort((a: Message, b: Message) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

// Send a message
export const sendMessage = (
  fromUser: any,
  toUserId: string,
  content: string,
  messageType: 'general' | 'collaboration' | 'support',
  parentMessageId?: string
): Message => {
  try {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: fromUser.id,
      fromUser: {
        id: fromUser.id,
        username: fromUser.username,
        displayName: fromUser.displayName,
        accentColor: fromUser.accentColor,
        verified: fromUser.verified,
        isArtist: fromUser.isArtist
      },
      toUserId,
      content,
      messageType,
      timestamp: new Date(),
      isRead: false,
      isStarred: false,
      parentMessageId,
      replies: [],
      conversationId: parentMessageId ? 
        getConversationId(parentMessageId) : 
        `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Get existing messages
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    const allMessages = storedMessages ? JSON.parse(storedMessages) : [];
    
    // Add new message
    allMessages.push(message);
    
    // Store back
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = (messageId: string, userId: string): void => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!storedMessages) return;
    
    const allMessages = JSON.parse(storedMessages);
    const messageIndex = allMessages.findIndex((msg: Message) => msg.id === messageId && msg.toUserId === userId);
    
    if (messageIndex >= 0) {
      allMessages[messageIndex].isRead = true;
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};

// Toggle star status
export const toggleMessageStar = (messageId: string, userId: string): void => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!storedMessages) return;
    
    const allMessages = JSON.parse(storedMessages);
    const messageIndex = allMessages.findIndex((msg: Message) => msg.id === messageId && msg.toUserId === userId);
    
    if (messageIndex >= 0) {
      allMessages[messageIndex].isStarred = !allMessages[messageIndex].isStarred;
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    }
  } catch (error) {
    console.error('Error toggling message star:', error);
  }
};

// Delete message
export const deleteMessage = (messageId: string, userId: string): void => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!storedMessages) return;
    
    const allMessages = JSON.parse(storedMessages);
    const filteredMessages = allMessages.filter((msg: Message) => 
      !(msg.id === messageId && msg.toUserId === userId)
    );
    
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(filteredMessages));
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

// Get unread message count
export const getUnreadMessageCount = (userId: string): number => {
  try {
    const messages = getUserMessages(userId);
    return messages.filter(msg => !msg.isRead).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Helper function to get conversation ID from a message
const getConversationId = (messageId: string): string => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!storedMessages) return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const allMessages = JSON.parse(storedMessages);
    const message = allMessages.find((msg: Message) => msg.id === messageId);
    return message?.conversationId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  } catch (error) {
    console.error('Error getting conversation ID:', error);
    return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Get messages with threading support - includes both sent and received conversations
export const getMessagesWithReplies = (userId: string): Message[] => {
  try {
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!storedMessages) return [];
    
    const allMessages = JSON.parse(storedMessages);
    
    // Convert timestamps back to Date objects
    const messages = allMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
      replies: msg.replies || []
    }));
    
    // Get messages for this user (both sent to them AND from them)
    const userMessages = messages.filter((msg: Message) => 
      msg.toUserId === userId || msg.fromUserId === userId
    );
    
    // Group messages by conversation and build threading
    const conversationMap = new Map<string, Message[]>();
    
    userMessages.forEach((msg: Message) => {
      const convId = msg.conversationId;
      if (!conversationMap.has(convId)) {
        conversationMap.set(convId, []);
      }
      conversationMap.get(convId)!.push(msg);
    });
    
    // Build threaded conversations
    const threadedMessages: Message[] = [];
    
    conversationMap.forEach((conversationMessages) => {
      // Sort messages in conversation by timestamp
      conversationMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Find the root message (no parent)
      const rootMessage = conversationMessages.find(msg => !msg.parentMessageId);
      if (rootMessage) {
        // Add replies to root message
        rootMessage.replies = conversationMessages.filter(msg => msg.parentMessageId === rootMessage.id);
        threadedMessages.push(rootMessage);
      } else {
        // If no root found, treat first message as root
        if (conversationMessages.length > 0) {
          const firstMessage = conversationMessages[0];
          firstMessage.replies = conversationMessages.slice(1);
          threadedMessages.push(firstMessage);
        }
      }
    });
    
    // Sort by latest activity (either main message or latest reply)
    return threadedMessages.sort((a, b) => {
      const aLatest = a.replies && a.replies.length > 0 ? 
        Math.max(a.timestamp.getTime(), ...a.replies.map(r => r.timestamp.getTime())) : 
        a.timestamp.getTime();
      const bLatest = b.replies && b.replies.length > 0 ? 
        Math.max(b.timestamp.getTime(), ...b.replies.map(r => r.timestamp.getTime())) : 
        b.timestamp.getTime();
      return bLatest - aLatest;
    });
  } catch (error) {
    console.error('Error loading threaded messages:', error);
    return [];
  }
};

// Send a reply to a specific message
export const sendReply = (
  fromUser: any,
  toUserId: string,
  content: string,
  parentMessageId: string,
  messageType: 'general' | 'collaboration' | 'support' = 'general'
): Message => {
  return sendMessage(fromUser, toUserId, content, messageType, parentMessageId);
};

// Initialize with some demo messages for new users
export const initializeDemoMessages = (userId: string): void => {
  try {
    const existingMessages = getUserMessages(userId);
    if (existingMessages.length > 0) return; // Already has messages
    
    const demoSenders = [
      {
        id: 'fan-1',
        username: 'beat_seeker',
        displayName: 'Beat Seeker',
        accentColor: 'blue',
        verified: false,
        isArtist: false
      },
      {
        id: 'artist-1', 
        username: 'neon_dreams',
        displayName: 'Neon Dreams',
        accentColor: 'coral',
        verified: true,
        isArtist: true
      },
      {
        id: 'fan-2',
        username: 'vinyl_collector', 
        displayName: 'Vinyl Collector',
        accentColor: 'mint',
        verified: false,
        isArtist: false
      }
    ];

    const demoMessages = [
      {
        fromUser: demoSenders[0],
        content: "Hey! Love your music taste. Let's connect and share some discoveries!",
        messageType: 'general' as const,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        fromUser: demoSenders[1],
        content: "I saw your crate 'Underground Gems' and would love to collaborate on a project together.",
        messageType: 'collaboration' as const,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        fromUser: demoSenders[2],
        content: "Thanks for supporting independent music. Your recommendations have been amazing!",
        messageType: 'support' as const,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      }
    ];

    // Store demo messages
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '[]');
    
    demoMessages.forEach((demoMsg, index) => {
      const conversationId = `conv-demo-${userId}-${index}`;
      const message: Message = {
        id: `demo-msg-${userId}-${index}`,
        fromUserId: demoMsg.fromUser.id,
        fromUser: demoMsg.fromUser,
        toUserId: userId,
        content: demoMsg.content,
        messageType: demoMsg.messageType,
        timestamp: demoMsg.timestamp,
        isRead: index > 0, // First message is unread
        isStarred: index === 1, // Second message is starred
        replies: [],
        conversationId
      };
      
      allMessages.push(message);
      
      // Add a demo reply to the first message
      if (index === 0) {
        const replyMessage: Message = {
          id: `demo-reply-${userId}-${index}`,
          fromUserId: userId,
          fromUser: {
            id: userId,
            username: 'you',
            displayName: 'You',
            accentColor: 'coral',
            verified: false,
            isArtist: false
          },
          toUserId: demoMsg.fromUser.id,
          content: "Thanks! I'd love to discover new music together.",
          messageType: 'general',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
          isRead: true,
          isStarred: false,
          parentMessageId: message.id,
          replies: [],
          conversationId
        };
        
        allMessages.push(replyMessage);
      }
    });
    
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
  } catch (error) {
    console.error('Error initializing demo messages:', error);
  }
};