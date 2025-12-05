import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import {
  MessageCircle,
  Send,
  UserPlus,
  CheckCircle,
  Star,
  Trash2,
  ArrowLeft,
  Filter,
  Search,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';
import { messagesApi } from '@/lib/api';
import type { Conversation, DirectMessage, ConversationParticipant } from '@/lib/api/types';

interface MessagesViewProps {
  user: {
    id: string;
    username?: string;
    displayName?: string;
    accentColor?: string;
  };
  onSendMessage?: (recipientId: string, message: string, messageType: string) => void;
  onBackToFeed?: () => void;
}

export function MessagesView({ user, onBackToFeed }: MessagesViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await messagesApi.getConversations();
      setConversations(data);

      // Also fetch unread count
      const unreadData = await messagesApi.getUnreadCount();
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when conversation is selected
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await messagesApi.getMessages(conversationId);
      setMessages(data.messages);

      // Mark as read
      await messagesApi.markAsRead(conversationId);

      // Update unread count
      const unreadData = await messagesApi.getUnreadCount();
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get the other participant in a conversation
  const getOtherParticipant = useCallback((conversation: Conversation): ConversationParticipant | null => {
    return conversation.participants.find(p => p.userId !== user.id) || null;
  }, [user.id]);

  const getInitialBadgeColor = (accentColor?: string) => {
    switch (accentColor) {
      case 'coral': return 'bg-accent-coral text-background';
      case 'blue': return 'bg-accent-blue text-background';
      case 'mint': return 'bg-accent-mint text-background';
      case 'yellow': return 'bg-accent-yellow text-background';
      default: return 'bg-foreground text-background';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      const sentMessage = await messagesApi.sendMessage(selectedConversation.id, {
        content: newMessage.trim()
      });

      // Add the new message to the list
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    // Note: Backend doesn't have delete endpoint yet, this is a placeholder
    toast.info('Delete conversation feature coming soon');
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (filter === 'unread' && !conversation.unreadCount) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const otherParticipant = getOtherParticipant(conversation);
      const matchesParticipant = otherParticipant?.user.profile?.displayName?.toLowerCase().includes(query) ||
                                  otherParticipant?.user.profile?.username?.toLowerCase().includes(query);
      const matchesLastMessage = conversation.lastMessage?.content.toLowerCase().includes(query);

      if (!matchesParticipant && !matchesLastMessage) return false;
    }

    return true;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent-coral" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-foreground/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToFeed}
                className="font-mono uppercase tracking-wide"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-accent-coral" />
                <div>
                  <h1 className="font-black">Messages</h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-40 md:w-48 lg:w-64"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    {filter === 'all' ? 'All' : 'Unread'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread ({unreadCount})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

          {/* Mobile: Show either conversation list or chat */}
          <div className="lg:hidden">
            {selectedConversation ? (
              <MobileChatView
                conversation={selectedConversation}
                messages={messages}
                user={user}
                isLoadingMessages={isLoadingMessages}
                isSending={isSending}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                handleKeyPress={handleKeyPress}
                handleDeleteConversation={handleDeleteConversation}
                onBack={() => setSelectedConversation(null)}
                getOtherParticipant={getOtherParticipant}
                getInitialBadgeColor={getInitialBadgeColor}
                chatScrollRef={chatScrollRef}
              />
            ) : (
              <ConversationList
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                user={user}
                onSelectConversation={setSelectedConversation}
                getOtherParticipant={getOtherParticipant}
                getInitialBadgeColor={getInitialBadgeColor}
              />
            )}
          </div>

          {/* Desktop Conversations List */}
          <div className="hidden lg:block lg:col-span-1">
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              user={user}
              onSelectConversation={setSelectedConversation}
              getOtherParticipant={getOtherParticipant}
              getInitialBadgeColor={getInitialBadgeColor}
            />
          </div>

          {/* Desktop Chat View */}
          <div className="hidden lg:block lg:col-span-2">
            <Card className="h-full">
              {selectedConversation ? (
                <DesktopChatView
                  conversation={selectedConversation}
                  messages={messages}
                  user={user}
                  isLoadingMessages={isLoadingMessages}
                  isSending={isSending}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  handleKeyPress={handleKeyPress}
                  handleDeleteConversation={handleDeleteConversation}
                  getOtherParticipant={getOtherParticipant}
                  getInitialBadgeColor={getInitialBadgeColor}
                  chatScrollRef={chatScrollRef}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation to start chatting
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversation List Component
interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  user: { id: string };
  onSelectConversation: (conversation: Conversation) => void;
  getOtherParticipant: (conversation: Conversation) => ConversationParticipant | null;
  getInitialBadgeColor: (color?: string) => string;
}

function ConversationList({
  conversations,
  selectedConversation,
  user,
  onSelectConversation,
  getOtherParticipant,
  getInitialBadgeColor
}: ConversationListProps) {
  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h3 className="font-semibold mb-4">
            Conversations ({conversations.length})
          </h3>

          <div className="space-y-2">
            <AnimatePresence>
              {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const displayName = otherParticipant?.user.profile?.displayName ||
                                   otherParticipant?.user.profile?.username ||
                                   'Unknown User';
                const hasUnread = (conversation.unreadCount || 0) > 0;

                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-muted border-accent-coral'
                        : 'border-foreground/10 hover:bg-muted/50'
                    } ${hasUnread ? 'border-l-4 border-l-accent-coral' : ''}`}
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 ${getInitialBadgeColor('mint')} flex items-center justify-center font-black text-xs flex-shrink-0`}>
                        {displayName[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${hasUnread ? 'font-black' : ''}`}>
                              {displayName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {hasUnread && (
                              <div className="w-2 h-2 bg-accent-coral rounded-full" />
                            )}
                          </div>
                        </div>

                        {conversation.lastMessage && (
                          <>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {conversation.lastMessage.senderId === user.id ? 'You: ' : ''}
                              {conversation.lastMessage.content}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No conversations yet
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}

// Desktop Chat View Component
interface ChatViewProps {
  conversation: Conversation;
  messages: DirectMessage[];
  user: { id: string };
  isLoadingMessages: boolean;
  isSending: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleDeleteConversation: (id: string) => void;
  getOtherParticipant: (conversation: Conversation) => ConversationParticipant | null;
  getInitialBadgeColor: (color?: string) => string;
  chatScrollRef: React.RefObject<HTMLDivElement>;
}

function DesktopChatView({
  conversation,
  messages,
  user,
  isLoadingMessages,
  isSending,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
  handleDeleteConversation,
  getOtherParticipant,
  getInitialBadgeColor,
  chatScrollRef
}: ChatViewProps) {
  const otherParticipant = getOtherParticipant(conversation);
  const displayName = otherParticipant?.user.profile?.displayName ||
                     otherParticipant?.user.profile?.username ||
                     'Unknown User';
  const username = otherParticipant?.user.profile?.username || 'user';

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-foreground/10 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${getInitialBadgeColor('mint')} flex items-center justify-center font-black`}>
              {displayName[0]?.toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black">{displayName}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-mono">@{username}</p>
            </div>
          </div>

          {/* Chat Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDeleteConversation(conversation.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto" ref={chatScrollRef}>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent-coral" />
              </div>
            ) : (
              messages.map((message, index) => {
                const isFromCurrentUser = message.senderId === user.id;
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showHeader = index === 0 || previousMessage?.senderId !== message.senderId;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
                      {showHeader && (
                        <div className={`flex items-center gap-2 mb-1 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {!isFromCurrentUser && (
                            <div className={`w-6 h-6 ${getInitialBadgeColor('mint')} flex items-center justify-center font-black text-xs`}>
                              {message.sender.profile?.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <span className="text-sm font-medium">
                            {isFromCurrentUser ? 'You' : (message.sender.profile?.displayName || 'User')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      <div className={`p-3 rounded-2xl ${
                        isFromCurrentUser
                          ? 'bg-accent-coral text-background ml-4'
                          : 'bg-muted mr-4'
                      } ${!showHeader ? (isFromCurrentUser ? 'ml-8' : 'mr-8') : ''}`}>
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        {message.isEdited && (
                          <span className="text-xs opacity-70">(edited)</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-foreground/10 bg-muted/30">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${displayName}...`}
              className="min-h-[44px] max-h-[120px] resize-none border-none bg-background focus:ring-1 focus:ring-accent-coral"
              rows={1}
              disabled={isSending}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            size="sm"
            className="bg-accent-coral text-background hover:bg-accent-coral/90 h-[44px] px-4"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
          <p className="text-xs text-muted-foreground">
            {newMessage.length}/500
          </p>
        </div>
      </div>
    </div>
  );
}

// Mobile Chat View Component
interface MobileChatViewProps extends ChatViewProps {
  onBack: () => void;
}

function MobileChatView({
  conversation,
  messages,
  user,
  isLoadingMessages,
  isSending,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
  handleDeleteConversation,
  onBack,
  getOtherParticipant,
  getInitialBadgeColor,
  chatScrollRef
}: MobileChatViewProps) {
  const otherParticipant = getOtherParticipant(conversation);
  const displayName = otherParticipant?.user.profile?.displayName ||
                     otherParticipant?.user.profile?.username ||
                     'Unknown User';

  return (
    <Card className="h-full">
      <div className="h-full flex flex-col">
        {/* Mobile Chat Header */}
        <div className="p-4 border-b border-foreground/10 bg-muted/30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className={`w-8 h-8 ${getInitialBadgeColor('mint')} flex items-center justify-center font-black text-xs`}>
              {displayName[0]?.toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black">{displayName}</h3>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDeleteConversation(conversation.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Chat Messages */}
        <div className="flex-1 overflow-y-auto" ref={chatScrollRef}>
          <div className="p-3 space-y-3">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent-coral" />
              </div>
            ) : (
              messages.map((message, index) => {
                const isFromCurrentUser = message.senderId === user.id;
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showHeader = index === 0 || previousMessage?.senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
                      {showHeader && (
                        <div className={`flex items-center gap-2 mb-1 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {!isFromCurrentUser && (
                            <div className={`w-5 h-5 ${getInitialBadgeColor('mint')} flex items-center justify-center font-black text-xs`}>
                              {message.sender.profile?.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <span className="text-xs font-medium">
                            {isFromCurrentUser ? 'You' : (message.sender.profile?.displayName || 'User')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      <div className={`p-3 rounded-2xl ${
                        isFromCurrentUser
                          ? 'bg-accent-coral text-background'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mobile Chat Input */}
        <div className="p-3 border-t border-foreground/10 bg-muted/30">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-[100px] resize-none border-none bg-background text-sm"
                rows={1}
                disabled={isSending}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
              className="bg-accent-coral text-background hover:bg-accent-coral/90 h-[40px] px-3"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
