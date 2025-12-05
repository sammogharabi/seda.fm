# Comments System - README

## Overview
The Comments System is sedā.fm's discussion platform that allows users to engage in conversations about posts, tracks, and other content. It supports threaded replies, reactions, and rich text formatting while maintaining the underground music collective aesthetic.

## Component Location
- **Main Component**: `/components/Comments.tsx`

## Feature Description
The Comments System provides:
- Threaded comment conversations
- Reply functionality
- Likes/reactions
- User mentions (@username)
- Link parsing and previews
- Comment timestamps
- Edit/delete options
- Report functionality
- Real-time updates (future)

## User Experience

### Comment Flow
1. View post or content
2. Scroll to comments section
3. Type comment in input field
4. Optional: Add mentions, links
5. Submit comment
6. Comment appears immediately
7. Others can reply to comment
8. Get notifications on replies

### Reply Flow
1. Click "Reply" on a comment
2. Reply input appears below
3. Parent comment context shown
4. Type reply
5. Submit
6. Reply nested under parent

## Visual Design

### Comment Thread Layout
```
┌────────────────────────────────────┐
│ [S] Sarah                    2h ago │
│ This track is amazing! Love the    │
│ production quality. 🔥             │
│ ♥ 12  💬 Reply                     │
│                                     │
│   ├── [M] Marcus           1h ago  │
│   │   Totally agree! The bass is   │
│   │   incredible                   │
│   │   ♥ 3  💬 Reply                │
│   │                                 │
│   └── [A] Alex            30m ago  │
│       Yeah @Sarah the mixing is    │
│       on point                      │
│       ♥ 5  💬 Reply                │
└────────────────────────────────────┘
```

## Technical Implementation

### Component Structure
```typescript
export function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const handleSubmit = async () => {
    const comment: Comment = {
      id: generateId(),
      postId,
      userId: currentUser.id,
      content: newComment,
      parentId: replyingTo,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };
    
    await createComment(comment);
    setComments([comment, ...comments]);
    setNewComment('');
    setReplyingTo(null);
  };

  return (
    <div className="comments-section">
      <CommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleSubmit}
        placeholder="Add a comment..."
      />
      
      <CommentsList>
        {comments.map(comment => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onReply={setReplyingTo}
          />
        ))}
      </CommentsList>
    </div>
  );
}
```

### Data Structure
```typescript
interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
  replies: Comment[];
  mentions: string[];
  links: string[];
  isEdited: boolean;
  isDeleted: boolean;
}

interface CommentWithUser extends Comment {
  user: {
    id: string;
    displayName: string;
    username: string;
    accentColor: string;
  };
}
```

## Comment Features

### 1. Comment Input
```tsx
<CommentInput>
  <UserBadge user={currentUser} size="sm" />
  <TextArea
    value={comment}
    onChange={setComment}
    placeholder="Add a comment..."
    rows={3}
    maxLength={500}
  />
  <CommentActions>
    <CharCount current={comment.length} max={500} />
    <SubmitButton disabled={!comment.trim()}>
      Post
    </SubmitButton>
  </CommentActions>
</CommentInput>
```

### 2. Comment Display
```tsx
<CommentCard>
  <CommentHeader>
    <UserBadge 
      user={comment.user}
      showName
      showTimestamp
      timestamp={comment.createdAt}
    />
    {comment.isEdited && (
      <EditedLabel>(edited)</EditedLabel>
    )}
    <CommentMenu>
      {isOwnComment && (
        <>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </>
      )}
      <MenuItem onClick={handleReport}>Report</MenuItem>
    </CommentMenu>
  </CommentHeader>
  
  <CommentContent>
    {parseCommentContent(comment.content)}
  </CommentContent>
  
  <CommentActions>
    <LikeButton 
      liked={comment.likedBy.includes(currentUser.id)}
      count={comment.likes}
      onClick={handleLike}
    />
    <ReplyButton onClick={() => setReplyingTo(comment.id)}>
      Reply
    </ReplyButton>
  </CommentActions>
  
  {comment.replies.length > 0 && (
    <CommentReplies>
      {comment.replies.map(reply => (
        <Comment key={reply.id} comment={reply} nested />
      ))}
    </CommentReplies>
  )}
</CommentCard>
```

### 3. Threaded Replies
```typescript
const buildCommentTree = (comments: Comment[]): CommentWithReplies[] => {
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];
  
  // First pass: create comment objects
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });
  
  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });
  
  return rootComments;
};
```

### 4. User Mentions
```typescript
const parseMentions = (text: string): ParsedContent => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  
  const parsed = text.replace(mentionRegex, (match, username) => {
    mentions.push(username);
    return `<span class="mention" data-username="${username}">@${username}</span>`;
  });
  
  return { parsed, mentions };
};

// In component
<CommentContent 
  dangerouslySetInnerHTML={{ __html: parseMentions(comment.content).parsed }}
  onClick={handleMentionClick}
/>
```

### 5. Link Parsing
```typescript
const parseLinks = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="comment-link">${url}</a>`;
  });
};
```

### 6. Edit Comment
```typescript
const handleEdit = async (commentId: string, newContent: string) => {
  const updated = await updateComment(commentId, {
    content: newContent,
    updatedAt: new Date().toISOString(),
    isEdited: true
  });
  
  setComments(comments.map(c => 
    c.id === commentId ? { ...c, ...updated } : c
  ));
  
  toast.success('Comment updated');
};
```

### 7. Delete Comment
```typescript
const handleDelete = async (commentId: string) => {
  // Soft delete - keep comment structure for replies
  await updateComment(commentId, {
    isDeleted: true,
    content: '[deleted]'
  });
  
  setComments(comments.map(c => 
    c.id === commentId 
      ? { ...c, isDeleted: true, content: '[deleted]' }
      : c
  ));
  
  toast.success('Comment deleted');
};
```

## Comment Actions

### Like Comment
```typescript
const handleLike = async (commentId: string) => {
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return;
  
  const hasLiked = comment.likedBy.includes(currentUser.id);
  
  if (hasLiked) {
    // Unlike
    await unlikeComment(commentId, currentUser.id);
    setComments(comments.map(c =>
      c.id === commentId
        ? {
            ...c,
            likes: c.likes - 1,
            likedBy: c.likedBy.filter(id => id !== currentUser.id)
          }
        : c
    ));
  } else {
    // Like
    await likeComment(commentId, currentUser.id);
    setComments(comments.map(c =>
      c.id === commentId
        ? {
            ...c,
            likes: c.likes + 1,
            likedBy: [...c.likedBy, currentUser.id]
          }
        : c
    ));
    
    // Notify comment author
    if (comment.userId !== currentUser.id) {
      sendNotification(comment.userId, {
        type: 'comment_liked',
        from: currentUser.id,
        commentId
      });
    }
  }
};
```

### Report Comment
```typescript
const handleReport = async (commentId: string, reason: string) => {
  await reportComment({
    commentId,
    reportedBy: currentUser.id,
    reason,
    timestamp: new Date().toISOString()
  });
  
  toast.success('Comment reported');
};
```

## Design System

### Colors
- Comment card: `#1a1a1a`
- Nested comment: `#0a0a0a`
- Border: `#333`
- Mention highlight: `#ff6b6b` with opacity
- Link color: `#4ecdc4`
- Like active: `#ff6b6b`

### Typography
- Comment text: Default size
- Username: `font-mono`
- Timestamp: `font-mono text-xs opacity-50`
- Character count: `font-mono text-xs`

### Spacing
- Comment padding: 16px
- Reply indent: 32px (desktop), 16px (mobile)
- Gap between comments: 12px
- Action buttons: 8px gap

## Comment Sorting

### Sort Options
```typescript
type SortOption = 'newest' | 'oldest' | 'top' | 'controversial';

const sortComments = (
  comments: Comment[],
  sortBy: SortOption
): Comment[] => {
  switch (sortBy) {
    case 'newest':
      return [...comments].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    case 'oldest':
      return [...comments].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    
    case 'top':
      return [...comments].sort((a, b) => b.likes - a.likes);
    
    case 'controversial':
      return [...comments].sort((a, b) => {
        const scoreA = a.likes + a.replies.length;
        const scoreB = b.likes + b.replies.length;
        return scoreB - scoreA;
      });
    
    default:
      return comments;
  }
};
```

### Sort UI
```tsx
<SortSelector>
  <SortOption 
    active={sortBy === 'newest'}
    onClick={() => setSortBy('newest')}
  >
    Newest
  </SortOption>
  <SortOption 
    active={sortBy === 'top'}
    onClick={() => setSortBy('top')}
  >
    Top
  </SortOption>
  <SortOption 
    active={sortBy === 'oldest'}
    onClick={() => setSortBy('oldest')}
  >
    Oldest
  </SortOption>
</SortSelector>
```

## Notifications

### Comment Reply Notification
```typescript
const notifyReply = async (parentComment: Comment, reply: Comment) => {
  // Don't notify if replying to own comment
  if (parentComment.userId === reply.userId) return;
  
  await sendNotification(parentComment.userId, {
    type: 'comment_reply',
    from: reply.userId,
    commentId: reply.id,
    parentCommentId: parentComment.id,
    postId: parentComment.postId,
    timestamp: reply.createdAt
  });
};
```

### Mention Notification
```typescript
const notifyMentions = async (comment: Comment, mentions: string[]) => {
  for (const username of mentions) {
    const user = await getUserByUsername(username);
    if (user && user.id !== comment.userId) {
      await sendNotification(user.id, {
        type: 'mention',
        from: comment.userId,
        commentId: comment.id,
        postId: comment.postId,
        timestamp: comment.createdAt
      });
    }
  }
};
```

## Mobile Experience

### Touch Optimizations
- Swipe to reply
- Long press for menu
- Bottom sheet for actions
- Larger touch targets
- Collapsible threads

### Mobile Layout
```tsx
<MobileComment>
  <CommentHeader>
    <UserBadge size="sm" />
    <Timestamp />
    <MenuButton />
  </CommentHeader>
  
  <CommentContent />
  
  <CommentActions horizontal>
    <LikeButton />
    <ReplyButton />
  </CommentActions>
  
  {hasReplies && (
    <CollapseButton onClick={toggleReplies}>
      {collapsed ? 'Show' : 'Hide'} {replyCount} replies
    </CollapseButton>
  )}
</MobileComment>
```

## Performance Optimization

### Virtual Scrolling
For posts with many comments:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={comments.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <Comment comment={comments[index]} />
    </div>
  )}
</FixedSizeList>
```

### Pagination
```typescript
const [page, setPage] = useState(1);
const commentsPerPage = 20;

const loadMoreComments = async () => {
  const moreComments = await fetchComments(postId, page + 1);
  setComments([...comments, ...moreComments]);
  setPage(page + 1);
};
```

### Optimistic Updates
```typescript
const handleLike = (commentId: string) => {
  // Update UI immediately
  setComments(comments.map(c =>
    c.id === commentId
      ? { ...c, likes: c.likes + 1 }
      : c
  ));
  
  // Send to server
  likeComment(commentId).catch(() => {
    // Revert on error
    setComments(comments.map(c =>
      c.id === commentId
        ? { ...c, likes: c.likes - 1 }
        : c
    ));
    toast.error('Failed to like comment');
  });
};
```

## Moderation

### Auto-Moderation
```typescript
const checkCommentContent = (content: string): ModerationResult => {
  const bannedWords = ['spam', 'offensive', ...];
  const hasBannedWords = bannedWords.some(word => 
    content.toLowerCase().includes(word)
  );
  
  if (hasBannedWords) {
    return {
      approved: false,
      reason: 'Contains prohibited content'
    };
  }
  
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7) {
    return {
      approved: false,
      reason: 'Excessive capitalization'
    };
  }
  
  return { approved: true };
};
```

### Manual Moderation
- Flagged comments queue
- Moderator dashboard
- Ban/mute users
- Shadow banning
- Comment removal

## Accessibility

### Keyboard Navigation
```tsx
<CommentInput
  onKeyDown={(e) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  }}
/>
```

### Screen Reader Support
```tsx
<Comment
  role="article"
  aria-label={`Comment by ${comment.user.displayName}`}
>
  <CommentContent
    aria-label="Comment content"
  >
    {comment.content}
  </CommentContent>
  
  <LikeButton
    aria-label={`Like comment, ${comment.likes} likes`}
    aria-pressed={isLiked}
  />
  
  <ReplyButton
    aria-label="Reply to comment"
  />
</Comment>
```

## Backend Integration (Future)

### API Endpoints (Planned)
```
GET    /api/posts/:postId/comments     - Get comments
POST   /api/posts/:postId/comments     - Create comment
PUT    /api/comments/:id                - Update comment
DELETE /api/comments/:id                - Delete comment
POST   /api/comments/:id/like          - Like comment
DELETE /api/comments/:id/like          - Unlike comment
POST   /api/comments/:id/report        - Report comment
```

### Real-time Updates
Using WebSocket for live comments:
```typescript
useEffect(() => {
  const ws = new WebSocket(`ws://api.seda.fm/posts/${postId}/comments`);
  
  ws.onmessage = (event) => {
    const newComment = JSON.parse(event.data);
    setComments(prev => [newComment, ...prev]);
  };
  
  return () => ws.close();
}, [postId]);
```

## Testing Checklist

### Functionality
- [ ] Create comment
- [ ] Reply to comment
- [ ] Edit comment
- [ ] Delete comment
- [ ] Like/unlike comment
- [ ] Mention users
- [ ] Parse links
- [ ] Sort comments
- [ ] Load more pagination

### UI/UX
- [ ] Responsive design
- [ ] Nested replies indent
- [ ] Timestamps display correctly
- [ ] Character count updates
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling

### Performance
- [ ] Fast comment submission
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Optimistic updates
- [ ] Efficient re-renders

## Future Enhancements

### Planned Features
1. **Rich Text Editor**
   - Bold, italic, strikethrough
   - Code blocks
   - Quotes
   - Lists

2. **Reactions**
   - Emoji reactions
   - Custom reactions
   - Reaction counts

3. **Comment Threads**
   - Collapse/expand threads
   - Thread permalinks
   - "Continue this thread" links

4. **Media in Comments**
   - Image uploads
   - GIF support
   - Audio snippets

5. **Smart Replies**
   - AI-suggested replies
   - Quick responses
   - Templates

6. **Comment Awards**
   - Give awards to comments
   - Award types (helpful, funny, etc.)
   - Award animations

## Related Features
- **Social Feed**: Post comments
- **User Profiles**: Comment history
- **Notifications**: Comment alerts

## Related Documentation
- `ARCHITECTURE.md` - System design
- `COMPONENT-GUIDE.md` - Components
- `README-SOCIAL-FEED.md` - Feed integration
- `FEATURE-POST-COMMENT-HISTORY.md` - History feature

## Quick Reference

### Create Comment
```typescript
const createComment = async (content: string, postId: string) => {
  const comment = {
    id: generateId(),
    postId,
    userId: currentUser.id,
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: []
  };
  
  await saveComment(comment);
  return comment;
};
```

### Build Comment Tree
```typescript
const treeComments = buildCommentTree(flatComments);
```

## Status
✅ **Current**: Working with mock data  
⏳ **Next**: Backend integration, real-time updates  
🚀 **Future**: Rich text, reactions, media support
