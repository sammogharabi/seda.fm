import { useState, useCallback, useEffect, useRef } from 'react';
import { searchApi } from '../lib/api/search';

export interface SearchResults {
  users?: any[];
  tracks?: any[];
  artists?: any[];
  crates?: any[];
  rooms?: any[];
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
        type: searchType as any,
        limit: 20,
      });

      setResults(data);
      setError(null);
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }

      console.error('Search error:', err);
      setError(err.message || 'Failed to search. Please try again.');
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
