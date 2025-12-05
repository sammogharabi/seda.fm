import { useState, useEffect, useCallback } from 'react';
import feedService, { GetFeedParams } from '../services/feedService';
import { toast } from 'sonner';

export interface UseFeedOptions {
  mode?: 'personalized' | 'global';
  autoFetch?: boolean;
}

export const useFeed = (options: UseFeedOptions = {}) => {
  const { mode = 'global', autoFetch = true } = options;

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Fetch feed data
  const fetchFeed = useCallback(async (params?: GetFeedParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const feedParams = {
        limit: 20,
        ...params,
      };

      const data = mode === 'personalized'
        ? await feedService.getFeed(feedParams)
        : await feedService.getGlobalFeed(feedParams);

      // Handle pagination
      if (params?.cursor) {
        // Append to existing posts
        setPosts((prev) => [...prev, ...(data.posts || data)]);
      } else {
        // Replace posts (initial load or refresh)
        setPosts(data.posts || data);
      }

      // Update cursor for next page
      if (data.nextCursor) {
        setCursor(data.nextCursor);
        setHasMore(true);
      } else {
        setHasMore(false);
      }

      return data;
    } catch (err: any) {
      console.error('Failed to fetch feed:', err);
      setError(err);
      toast.error('Failed to load feed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    await fetchFeed({ cursor });
  }, [cursor, hasMore, isLoading, fetchFeed]);

  // Refresh feed
  const refresh = useCallback(async () => {
    setCursor(undefined);
    await fetchFeed();
  }, [fetchFeed]);

  // Like a post (optimistic update)
  const likePost = useCallback(async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: true,
                _count: {
                  ...post._count,
                  likes: (post._count?.likes || 0) + 1,
                },
              }
            : post
        )
      );

      await feedService.likePost(postId);
      toast.success('Post liked');
    } catch (err) {
      console.error('Failed to like post:', err);
      // Revert optimistic update
      await refresh();
      toast.error('Failed to like post');
    }
  }, [refresh]);

  // Unlike a post (optimistic update)
  const unlikePost = useCallback(async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: false,
                _count: {
                  ...post._count,
                  likes: Math.max((post._count?.likes || 0) - 1, 0),
                },
              }
            : post
        )
      );

      await feedService.unlikePost(postId);
    } catch (err) {
      console.error('Failed to unlike post:', err);
      // Revert optimistic update
      await refresh();
      toast.error('Failed to unlike post');
    }
  }, [refresh]);

  // Delete a post
  const deletePost = useCallback(async (postId: string) => {
    try {
      await feedService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchFeed();
    }
  }, [autoFetch, fetchFeed]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    fetchFeed,
    loadMore,
    refresh,
    likePost,
    unlikePost,
    deletePost,
  };
};

export default useFeed;
