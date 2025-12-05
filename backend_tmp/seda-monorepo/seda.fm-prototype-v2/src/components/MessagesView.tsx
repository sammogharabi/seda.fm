import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import {
  MessageCircle,
  Send,
  Heart,
  UserPlus,
  CheckCircle,
  Clock,
  Star,
  Trash2,
  Reply,
  ArrowLeft,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';
import { 
  getUserMessages, 
  markMessageAsRead, 
  toggleMessageStar, 
  deleteMessage, 
  getUnreadMessageCount,
  initializeDemoMessages,
  sendMessage,
  sendReply,
  getMessagesWithReplies,
  type Message 
} from '../utils/messageService';



interface MessagesViewProps {
  user: any;
  onSendMessage?: (recipientId: string, message: string, messageType: string) => void;
  onBackToFeed?: () => void;
}



export function MessagesView({ user, onSendMessage, onBackToFeed }: MessagesViewProps) {
  const [conversations, setConversations] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Function to refresh conversations
  const refreshConversations = () => {
    const userMessages = getMessagesWithReplies(user.id);
    setConversations(userMessages);
  };

  // Helper to get the other person in a conversation
  const getOtherPerson = (conversation: Message) => {
    // If the message was sent by the current user, show the recipient
    if (conversation.fromUserId === user.id) {
      // If we have toUser info, use it
      if (conversation.toUser) {
        return conversation.toUser;
      }
      // Otherwise create a basic recipient object
      // Extract name from message content if it's a welcome message
      const nameMatch = conversation.content.match(/Hey ([^!]+)!/);
      const recipientName = nameMatch ? nameMatch[1] : 'Fan';
      
      return {
        id: conversation.toUserId,
        username: conversation.toUserId,
        displayName: recipientName,
        accentColor: 'mint',
        verified: false,
        isArtist: false
      };
    }
    // Otherwise show the sender
    return conversation.fromUser;
  };

  // Auto-scroll to bottom when new messages arrive or conversation changes
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, conversations]);

  useEffect(() => {
    // Initialize demo messages for new users
    initializeDemoMessages(user.id);
    
    // Load user's conversations with threading support
    refreshConversations();
  }, [user.id]);

  const getInitialBadgeColor = (accentColor: string) => {
    switch (accentColor) {
      case 'coral': return 'bg-accent-coral text-background';
      case 'blue': return 'bg-accent-blue text-background';
      case 'mint': return 'bg-accent-mint text-background';
      case 'yellow': return 'bg-accent-yellow text-background';
      default: return 'bg-foreground text-background';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'collaboration': return <UserPlus className="w-4 h-4" />;
      case 'support': return <Heart className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'collaboration': return 'text-accent-blue';
      case 'support': return 'text-accent-coral';
      default: return 'text-accent-mint';
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    markMessageAsRead(messageId, user.id);
    setConversations(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const handleToggleStar = (messageId: string) => {
    toggleMessageStar(messageId, user.id);
    setConversations(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const handleDeleteConversation = (messageId: string) => {
    deleteMessage(messageId, user.id);
    refreshConversations(); // Use refresh to ensure threading is maintained
    if (selectedConversation?.id === messageId) {
      setSelectedConversation(null);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Send reply to the other person in the conversation
      const recipientId = selectedConversation.fromUserId === user.id 
        ? selectedConversation.toUserId 
        : selectedConversation.fromUserId;
      
      const reply = sendReply(user, recipientId, newMessage, selectedConversation.id, 'general');
      
      // Update local state to show the reply immediately
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, replies: [...(conv.replies || []), reply] }
          : conv
      ));
      
      // Update selected conversation to show the new reply
      setSelectedConversation(prev => prev ? {
        ...prev,
        replies: [...(prev.replies || []), reply]
      } : null);

      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error toast
      toast.error('Failed to send message', {
        description: 'Please try again later'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (filter === 'unread' && conversation.isRead) return false;
    if (filter === 'starred' && !conversation.isStarred) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContent = conversation.content.toLowerCase().includes(query);
      const matchesSender = conversation.fromUser.displayName.toLowerCase().includes(query);
      
      // Also search in replies
      const matchesReplies = conversation.replies?.some(reply => 
        reply.content.toLowerCase().includes(query) ||
        reply.fromUser.displayName.toLowerCase().includes(query)
      ) || false;
      
      if (!matchesContent && !matchesSender && !matchesReplies) return false;
    }
    
    return true;
  });

  const unreadCount = conversations.filter(conv => !conv.isRead).length;
  
  // Get all messages in conversation for display
  const getAllMessagesInConversation = (conversation: Message) => {
    const allMessages = [conversation, ...(conversation.replies || [])];
    return allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

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
              {/* Hide search on mobile, show on tablet and up with responsive width */}
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
                    {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Starred'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread ({unreadCount})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('starred')}>
                    Starred ({conversations.filter(c => c.isStarred).length})
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
              // Mobile Chat View
              <Card className="h-full">
                <div className="h-full flex flex-col">
                  {/* Mobile Chat Header */}
                  <div className="p-4 border-b border-foreground/10 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        className="p-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className={`w-8 h-8 ${getInitialBadgeColor(getOtherPerson(selectedConversation).accentColor)} flex items-center justify-center font-black text-xs`}>
                        {getOtherPerson(selectedConversation).displayName[0]?.toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black">{getOtherPerson(selectedConversation).displayName}</h3>
                          {getOtherPerson(selectedConversation).verified && (
                            <CheckCircle className="w-4 h-4 text-accent-blue" />
                          )}
                          {getOtherPerson(selectedConversation).isArtist && (
                            <Badge variant="outline" className="text-xs">Artist</Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleToggleStar(selectedConversation.id)}>
                            <Star className="w-4 h-4 mr-2" />
                            {selectedConversation.isStarred ? 'Unstar' : 'Star'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteConversation(selectedConversation.id)}>
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
                      {getAllMessagesInConversation(selectedConversation).map((message, index) => {
                        const isFromCurrentUser = message.fromUserId === user.id;
                        const isFirstMessage = index === 0;
                        const previousMessage = index > 0 ? getAllMessagesInConversation(selectedConversation)[index - 1] : null;
                        const showHeader = isFirstMessage || previousMessage?.fromUserId !== message.fromUserId;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
                              {showHeader && (
                                <div className={`flex items-center gap-2 mb-1 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                  {!isFromCurrentUser && (
                                    <div className={`w-5 h-5 ${getInitialBadgeColor(message.fromUser.accentColor)} flex items-center justify-center font-black text-xs`}>
                                      {message.fromUser.displayName[0]?.toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-xs font-medium">
                                    {isFromCurrentUser ? 'You' : message.fromUser.displayName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      })}
                    </div>
                  </div>

                  {/* Mobile Chat Input */}
                  <div className="p-3 border-t border-foreground/10 bg-muted/30">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            setIsTyping(e.target.value.length > 0);
                          }}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="min-h-[40px] max-h-[100px] resize-none border-none bg-background text-sm"
                          rows={1}
                        />
                      </div>
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="bg-accent-coral text-background hover:bg-accent-coral/90 h-[40px] px-3"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              // Mobile Conversation List
              <Card className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">
                      Conversations ({filteredConversations.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {filteredConversations.map((conversation) => {
                        const lastMessage = conversation.replies && conversation.replies.length > 0 
                          ? conversation.replies[conversation.replies.length - 1]
                          : conversation;
                        const totalMessages = 1 + (conversation.replies?.length || 0);
                        
                        return (
                          <div
                            key={conversation.id}
                            className={`p-3 rounded-lg border transition-colors cursor-pointer border-foreground/10 hover:bg-muted/50 ${!conversation.isRead ? 'border-l-4 border-l-accent-coral' : ''}`}
                            onClick={() => {
                              setSelectedConversation(conversation);
                              if (!conversation.isRead) {
                                handleMarkAsRead(conversation.id);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 ${getInitialBadgeColor(getOtherPerson(conversation).accentColor)} flex items-center justify-center font-black text-sm`}>
                                {getOtherPerson(conversation).displayName[0]?.toUpperCase()}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <p className={`font-medium truncate ${!conversation.isRead ? 'font-black' : ''}`}>
                                      {getOtherPerson(conversation).displayName}
                                    </p>
                                    {getOtherPerson(conversation).verified && (
                                      <CheckCircle className="w-3 h-3 text-accent-blue" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {conversation.isStarred && (
                                      <Star className="w-3 h-3 text-accent-yellow fill-current" />
                                    )}
                                    {!conversation.isRead && (
                                      <div className="w-2 h-2 bg-accent-coral rounded-full" />
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                                  {lastMessage.fromUserId === user.id ? 'You: ' : ''}{lastMessage.content}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {totalMessages > 1 && (
                                      <div className="flex items-center gap-1 text-accent-mint">
                                        <MessageCircle className="w-3 h-3" />
                                        <span className="text-xs">{totalMessages}</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {lastMessage.timestamp.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {filteredConversations.length === 0 && (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">
                            No conversations yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </Card>
            )}
          </div>
          
          {/* Desktop Conversations List */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="h-full">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="font-semibold mb-4">
                    Conversations ({filteredConversations.length})
                  </h3>
                  
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredConversations.map((conversation) => {
                        const lastMessage = conversation.replies && conversation.replies.length > 0 
                          ? conversation.replies[conversation.replies.length - 1]
                          : conversation;
                        const totalMessages = 1 + (conversation.replies?.length || 0);
                        
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
                            } ${!conversation.isRead ? 'border-l-4 border-l-accent-coral' : ''}`}
                            onClick={() => {
                              setSelectedConversation(conversation);
                              if (!conversation.isRead) {
                                handleMarkAsRead(conversation.id);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 ${getInitialBadgeColor(getOtherPerson(conversation).accentColor)} flex items-center justify-center font-black text-xs flex-shrink-0`}>
                                {getOtherPerson(conversation).displayName[0]?.toUpperCase()}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-sm font-medium truncate ${!conversation.isRead ? 'font-black' : ''}`}>
                                      {getOtherPerson(conversation).displayName}
                                    </p>
                                    {getOtherPerson(conversation).verified && (
                                      <CheckCircle className="w-3 h-3 text-accent-blue flex-shrink-0" />
                                    )}
                                    {getOtherPerson(conversation).isArtist && (
                                      <Badge variant="outline" className="text-xs">Artist</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {conversation.isStarred && (
                                      <Star className="w-3 h-3 text-accent-yellow fill-current" />
                                    )}
                                    {!conversation.isRead && (
                                      <div className="w-2 h-2 bg-accent-coral rounded-full" />
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {lastMessage.fromUserId === user.id ? 'You: ' : ''}{lastMessage.content}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-1 ${getMessageTypeColor(conversation.messageType)}`}>
                                      {getMessageTypeIcon(conversation.messageType)}
                                      <span className="text-xs capitalize">{conversation.messageType}</span>
                                    </div>
                                    {totalMessages > 1 && (
                                      <div className="flex items-center gap-1 text-accent-mint">
                                        <MessageCircle className="w-3 h-3" />
                                        <span className="text-xs">{totalMessages}</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {lastMessage.timestamp.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    
                    {filteredConversations.length === 0 && (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {filter === 'unread' ? 'No unread conversations' : 
                           filter === 'starred' ? 'No starred conversations' : 
                           searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Desktop Chat View */}
          <div className="hidden lg:block lg:col-span-2">
            <Card className="h-full">
              {selectedConversation ? (
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-foreground/10 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${getInitialBadgeColor(getOtherPerson(selectedConversation).accentColor)} flex items-center justify-center font-black`}>
                          {getOtherPerson(selectedConversation).displayName[0]?.toUpperCase()}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black">{getOtherPerson(selectedConversation).displayName}</h3>
                            {getOtherPerson(selectedConversation).verified && (
                              <CheckCircle className="w-4 h-4 text-accent-blue" />
                            )}
                            {getOtherPerson(selectedConversation).isArtist && (
                              <Badge variant="outline">Artist</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">@{getOtherPerson(selectedConversation).username}</p>
                        </div>
                      </div>

                      {/* Chat Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStar(selectedConversation.id)}
                          className={selectedConversation.isStarred ? 'text-accent-yellow' : ''}
                        >
                          <Star className={`w-4 h-4 ${selectedConversation.isStarred ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDeleteConversation(selectedConversation.id)}>
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
                        {getAllMessagesInConversation(selectedConversation).map((message, index) => {
                          const isFromCurrentUser = message.fromUserId === user.id;
                          const isFirstMessage = index === 0;
                          const previousMessage = index > 0 ? getAllMessagesInConversation(selectedConversation)[index - 1] : null;
                          const showHeader = isFirstMessage || previousMessage?.fromUserId !== message.fromUserId;
                          
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
                                      <div className={`w-6 h-6 ${getInitialBadgeColor(message.fromUser.accentColor)} flex items-center justify-center font-black text-xs`}>
                                        {message.fromUser.displayName[0]?.toUpperCase()}
                                      </div>
                                    )}
                                    <span className="text-sm font-medium">
                                      {isFromCurrentUser ? 'You' : message.fromUser.displayName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                        
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="max-w-[70%]">
                              <div className="bg-muted mr-4 p-3 rounded-2xl">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
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
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            setIsTyping(e.target.value.length > 0);
                          }}
                          onKeyPress={handleKeyPress}
                          placeholder={`Message ${selectedConversation.fromUser.displayName}...`}
                          className="min-h-[44px] max-h-[120px] resize-none border-none bg-background focus:ring-1 focus:ring-accent-coral"
                          rows={1}
                        />
                      </div>
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="bg-accent-coral text-background hover:bg-accent-coral/90 h-[44px] px-4"
                      >
                        <Send className="w-4 h-4" />
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