import { useState, useCallback, useEffect, useRef } from 'react';
import { searchApi } from '../lib/api/search';
import type { SearchResults, SearchType } from '../types';

/**
 * Normalize artist data from backend format to frontend format
 * Backend returns: { id, userId, artistName, bio, verified, user: { profile: { username, displayName, avatarUrl } } }
 * Frontend expects: { id, userId, displayName, username, avatarUrl, verified, bio, accentColor, followers, genres }
 */
function normalizeArtist(artist: any): any {
  const profile = artist.user?.profile || {};
  return {
    id: artist.userId || artist.id,
    artistProfileId: artist.id,
    displayName: profile.displayName || artist.artistName || 'Unknown Artist',
    username: profile.username || '',
    avatarUrl: profile.avatarUrl || null,
    verified: artist.verified || false,
    bio: artist.bio || '',
    accentColor: 'coral', // Default accent color for artists
    followers: 0, // Not returned by search API
    genres: profile.genres || [],
    // Keep original data for navigation
    artistName: artist.artistName,
    websiteUrl: artist.websiteUrl,
    spotifyUrl: artist.spotifyUrl,
    bandcampUrl: artist.bandcampUrl,
    soundcloudUrl: artist.soundcloudUrl,
  };
}

/**
 * Normalize user data from backend format
 */
function normalizeUser(user: any): any {
  return {
    id: user.userId || user.id,
    userId: user.userId,
    displayName: user.displayName || user.username || 'Unknown User',
    username: user.username || '',
    avatarUrl: user.avatarUrl || null,
    bio: user.bio || '',
    accentColor: 'blue', // Default accent color for fans
    followers: 0,
    genres: user.genres || [],
  };
}

export function useSearch(query: string, activeTab: string) {
  const [results, setResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults({});
      setIsLoading(false);
      setError(null);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Map frontend tab names to backend search types
      const typeMap: Record<string, string> = {
        'all': 'all',
        'artists': 'artists',
        'tracks': 'tracks',
        'users': 'users',
        'rooms': 'rooms',
        'crates': 'crates',
      };

      const searchType = typeMap[activeTab] || 'all';

      const data = await searchApi.search({
        q: trimmedQuery,
        type: searchType as SearchType,
        limit: 20,
      });

      // Normalize the data for frontend consumption
      const normalizedData: SearchResults = {
        ...data,
        artists: data.artists?.map(normalizeArtist) || [],
        users: data.users?.map(normalizeUser) || [],
      };

      setResults(normalizedData);
      setError(null);
    } catch (err: unknown) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('Search error:', err);
      const message = err instanceof Error ? err.message : 'Failed to search. Please try again.';
      setError(message);
      setResults({});
    } finally {
      setIsLoading(false);
    }
  }, [query, activeTab]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      // Cancel ongoing request when query changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [performSearch]);

  return {
    results,
    isLoading,
    error,
    refetch: performSearch,
  };
}
