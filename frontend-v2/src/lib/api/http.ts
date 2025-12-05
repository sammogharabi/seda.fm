/**
 * Shared HTTP client for Sedā v2 API
 *
 * All API calls go through this client to ensure:
 * - Consistent base URL usage (VITE_API_BASE_URL)
 * - Auth token handling
 * - Error handling and response normalization
 * - Type safety
 */

import { supabase } from '../supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public error?: string
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

/**
 * Get auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const { data: { session } } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

/**
 * Shared fetch wrapper with error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers = {}, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (auth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: response.statusText || 'An error occurred',
        statusCode: response.status,
      }));

      throw new ApiException(
        errorData.message || 'Request failed',
        errorData.statusCode || response.status,
        errorData.error
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse JSON response
    const data: T = await response.json();
    return data;
  } catch (error) {
    // Re-throw ApiException
    if (error instanceof ApiException) {
      throw error;
    }

    // Network or other errors
    throw new ApiException(
      error instanceof Error ? error.message : 'Network error occurred',
      undefined,
      'NETWORK_ERROR'
    );
  }
}

/**
 * HTTP client methods
 */
export const http = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
