import React, { useState, useRef, useEffect } from 'react';
import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  MoreHorizontal,
  Crown,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

// Helper function to get accent color classes
const getAccentClasses = (color) => {
  const colorMap = {
    coral: {
      bg: 'bg-accent-coral',
      bgSubtle: 'bg-accent-coral/10',
      text: 'text-accent-coral',
      border: 'border-accent-coral'
    },
    blue: {
      bg: 'bg-accent-blue',
      bgSubtle: 'bg-accent-blue/10',
      text: 'text-accent-blue',
      border: 'border-accent-blue'
    },
    mint: {
      bg: 'bg-accent-mint',
      bgSubtle: 'bg-accent-mint/10',
      text: 'text-accent-mint',
      border: 'border-accent-mint'
    },
    yellow: {
      bg: 'bg-accent-yellow',
      bgSubtle: 'bg-accent-yellow/10',
      text: 'text-accent-yellow',
      border: 'border-accent-yellow'
    }
  };
  return colorMap[color] || colorMap.coral;
};

const formatTimestamp = (timestamp) => {
  const now = new Date();
  const diff = Math.floor((now - timestamp) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

// Individual Comment Component
function Comment({ comment, user, onReply, onLike, depth = 0, maxDepth = 3, onUserClick }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const replyInputRef = useRef(null);

  const handleReply = () => {
    if (!replyText.trim()) return;
    
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyForm(false);
    toast.success('Reply posted! Earned +3 Points');
  };

  const handleLike = () => {
    onLike(comment.id);
  };

  useEffect(() => {
    if (showReplyForm && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [showReplyForm]);

  const canReply = depth < maxDepth;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${depth > 0 ? 'ml-8 border-l-2 border-foreground/5 pl-4' : ''}`}
    >
      <div className="py-4">
        <div className="flex gap-3">
          {/* User Badge */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${getAccentClasses(comment.user.accentColor || 'coral').bg} border border-foreground/20 flex items-center justify-center`}>
              <span className="text-background font-semibold text-sm">
                {comment.user.username[0].toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Header */}
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => onUserClick?.(comment.user)}
                className="font-medium text-sm hover:text-accent-coral transition-colors cursor-pointer"
              >
                {comment.user.displayName || comment.user.username}
              </button>
              {comment.user.verified && (
                <Crown className="w-3 h-3 text-accent-yellow" />
              )}
              <button 
                onClick={() => onUserClick?.(comment.user)}
                className="text-xs text-muted-foreground hover:text-accent-coral transition-colors cursor-pointer"
              >
                @{comment.user.username}
              </button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
            </div>

            {/* Comment Content */}
            <div className="mb-3">
              <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 transition-all duration-200 ${
                  comment.isLiked 
                    ? 'bg-accent-coral/10 text-accent-coral hover:bg-accent-coral/20' 
                    : 'hover:bg-accent-coral/10 hover:text-accent-coral'
                }`}
                onClick={handleLike}
              >
                <Heart className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                {comment.likes > 0 && <span className="text-xs">{comment.likes}</span>}
              </Button>

              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 hover:bg-accent-blue/10 hover:text-accent-blue transition-all duration-200"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  <span className="text-xs">Reply</span>
                </Button>
              )}

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 hover:bg-accent-mint/10 hover:text-accent-mint transition-all duration-200"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span className="text-xs">
                    {isExpanded ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </Button>
              )}
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {showReplyForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-foreground/10"
                >
                  <div className="flex gap-3">
                    <div className={`w-6 h-6 ${getAccentClasses(user.accentColor || 'coral').bg} border border-foreground/20 flex items-center justify-center`}>
                      <span className="text-background font-semibold text-xs">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Textarea
                        ref={replyInputRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.user.username}...`}
                        className="min-h-[80px] mb-2 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleReply();
                          }
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Ctrl+Enter to post
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReplyForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleReply}
                            disabled={!replyText.trim()}
                            className="bg-accent-blue text-background hover:bg-accent-blue/90"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nested Replies */}
        <AnimatePresence>
          {hasReplies && isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2"
            >
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  user={user}
                  onReply={onReply}
                  onLike={onLike}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onUserClick={onUserClick}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Main Comments Component
export function Comments({ 
  postId, 
  comments = [], 
  user, 
  onAddComment, 
  onReplyToComment, 
  onLikeComment,
  isOpen = false,
  onToggle,
  onViewArtistProfile,
  onViewFanProfile,
  mockArtists = []
}) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  // Helper function to handle user click
  const handleUserClick = useCallback((commentUser) => {
    // Check if user is an artist by looking at verified status or checking mockArtists
    const isArtist = commentUser.verified || mockArtists.some(artist => 
      artist.username === commentUser.username || artist.id === commentUser.id
    );
    
    if (isArtist && onViewArtistProfile) {
      // Create a complete artist object if needed
      const artistData = mockArtists.find(artist => 
        artist.username === commentUser.username || artist.id === commentUser.id
      ) || {
        id: commentUser.id || `artist-${commentUser.username}`,
        username: commentUser.username,
        displayName: commentUser.displayName || commentUser.username,
        verified: commentUser.verified || false,
        accentColor: commentUser.accentColor || 'coral',
        bio: `Music creator and artist`,
        location: 'Unknown',
        genres: ['Electronic', 'Indie'],
        website: '',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
        socialLinks: {}
      };
      onViewArtistProfile(artistData);
    } else if (onViewFanProfile) {
      // Create a fan profile object
      const fanData = {
        id: commentUser.id || `fan-${commentUser.username}`,
        username: commentUser.username,
        displayName: commentUser.displayName || commentUser.username,
        verified: commentUser.verified || false,
        verificationStatus: 'not-requested',
        points: Math.floor(Math.random() * 2000) + 100,
        accentColor: commentUser.accentColor || 'coral',
        bio: `Music lover and community member`,
        location: 'Unknown',
        joinedDate: new Date('2024-01-15'),
        genres: ['Various'],
        connectedServices: ['Spotify'],
        isArtist: false,
        website: ''
      };
      onViewFanProfile(fanData);
    }
  }, [mockArtists, onViewArtistProfile, onViewFanProfile]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      await onAddComment(postId, newComment);
      setNewComment('');
      toast.success('Comment posted! Earned +3 Points');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentCommentId, replyText) => {
    onReplyToComment(postId, parentCommentId, replyText);
  };

  const handleLike = (commentId) => {
    onLikeComment(postId, commentId);
  };

  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-foreground/10 bg-secondary/20"
    >
      <div className="p-6">
        {/* Comments Header */}
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments ({comments.length})
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>

        {/* Add Comment Form */}
        <div className="mb-6 pb-6 border-b border-foreground/10">
          <div className="flex gap-3">
            <div className={`w-10 h-10 ${getAccentClasses(user.accentColor || 'coral').bg} border border-foreground/20 flex items-center justify-center`}>
              <span className="text-background font-semibold">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <Textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[100px] mb-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Ctrl+Enter to post
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-accent-coral text-background hover:bg-accent-coral/90"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-1">
          <AnimatePresence>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  user={user}
                  onReply={handleReply}
                  onLike={handleLike}
                  onUserClick={handleUserClick}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No comments yet</p>
                <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}