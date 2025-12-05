/**
 * API Client Example Component
 * Demonstrates how to use the new API clients in React components
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { feedApi, playlistsApi, profilesApi, discoverApi } from '../lib/api';
import type { FeedPost, Playlist, UserProfile } from '../lib/api';
import { ApiException } from '../lib/api';

export function ApiClientExample() {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [trending, setTrending] = useState<Playlist[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example 1: Fetch Feed
  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getFeed({ limit: 10 });
      setFeed(response.data);
      toast.success(`Loaded ${response.data.length} posts`);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
        toast.error(`Failed to load feed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Fetch Trending Playlists
  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const playlists = await playlistsApi.getTrending(10);
      setTrending(playlists);
      toast.success(`Loaded ${playlists.length} trending crates`);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
        toast.error(`Failed to load trending: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Fetch Current User Profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await profilesApi.getMe();
      setProfile(userProfile);
      toast.success(`Loaded profile: ${userProfile.displayName}`);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
        toast.error(`Failed to load profile: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Create a Post
  const createPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const newPost = await feedApi.createPost({
        type: 'TEXT',
        content: 'Hello from the new API client! 🎵',
      });
      toast.success('Post created successfully!');
      setFeed([newPost, ...feed]);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
        toast.error(`Failed to create post: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 5: Like a Post
  const likePost = async (postId: string) => {
    try {
      await feedApi.likePost(postId);
      toast.success('Post liked!');
      // Update local state
      setFeed(feed.map(post =>
        post.id === postId
          ? { ...post, hasLiked: true, _count: { ...post._count, likes: (post._count?.likes || 0) + 1 } }
          : post
      ));
    } catch (err) {
      if (err instanceof ApiException) {
        toast.error(`Failed to like post: ${err.message}`);
      }
    }
  };

  // Example 6: Search
  const searchContent = async (query: string) => {
    setLoading(true);
    try {
      const { searchApi } = await import('../lib/api');
      const results = await searchApi.search({ q: query, type: 'all', limit: 10 });
      toast.success(`Found ${(results.users?.length || 0) + (results.crates?.length || 0)} results`);
      console.log('Search results:', results);
    } catch (err) {
      if (err instanceof ApiException) {
        toast.error(`Search failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Client Examples</CardTitle>
          <CardDescription>
            Demonstrating the new type-safe API clients for Sedā v2
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchFeed} disabled={loading}>
              Load Feed
            </Button>
            <Button onClick={fetchTrending} disabled={loading}>
              Load Trending Crates
            </Button>
            <Button onClick={fetchProfile} disabled={loading}>
              Load My Profile
            </Button>
            <Button onClick={createPost} disabled={loading}>
              Create Post
            </Button>
            <Button onClick={() => searchContent('house music')} disabled={loading}>
              Search "house music"
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {/* Feed Results */}
          {feed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feed Posts ({feed.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {feed.map(post => (
                  <div key={post.id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{post.user.displayName}</p>
                        <p className="text-sm text-muted-foreground">@{post.user.username}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={post.hasLiked ? "default" : "outline"}
                        onClick={() => likePost(post.id)}
                      >
                        ❤️ {post._count?.likes || 0}
                      </Button>
                    </div>
                    {post.content && <p className="mt-2">{post.content}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Trending Crates */}
          {trending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Crates ({trending.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trending.map(playlist => (
                  <div key={playlist.id} className="p-3 border rounded-md">
                    <p className="font-medium">{playlist.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {playlist.owner.displayName} • {playlist._count?.items || 0} tracks
                    </p>
                    {playlist.genre && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary/10 rounded">
                        {playlist.genre}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Profile Info */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Username:</strong> @{profile.username}</p>
                  <p><strong>Display Name:</strong> {profile.displayName}</p>
                  {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
                  {profile.genres && profile.genres.length > 0 && (
                    <p><strong>Genres:</strong> {profile.genres.join(', ')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Code Example */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-lg">Example Code</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-x-auto">
{`import { feedApi, playlistsApi } from '@/lib/api';

// Fetch feed with pagination
const { data, hasMore, nextCursor } = await feedApi.getFeed({
  limit: 20
});

// Create a post
const newPost = await feedApi.createPost({
  type: 'TEXT',
  content: 'Hello Sedā! 🎵'
});

// Like a post
await feedApi.likePost(postId);

// Get trending playlists
const trending = await playlistsApi.getTrending(10);

// Error handling
try {
  const profile = await profilesApi.getMe();
} catch (err) {
  if (err instanceof ApiException) {
    console.error(err.message, err.statusCode);
  }
}`}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
