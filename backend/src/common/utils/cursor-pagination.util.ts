import { BadRequestException } from '@nestjs/common';

/**
 * Cursor-based pagination utility for consistent API pagination
 */
export interface CursorPaginationOptions {
  limit?: number;
  cursor?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface CursorInfo {
  id: string;
  sortValue: any;
}

/**
 * Encode cursor from item data
 */
export function encodeCursor(id: string, sortValue: any): string {
  const cursorData = { id, sortValue };
  return Buffer.from(JSON.stringify(cursorData)).toString('base64url');
}

/**
 * Decode cursor to extract item data
 */
export function decodeCursor(cursor: string): CursorInfo {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
    const parsed = JSON.parse(decoded);

    if (!parsed.id || parsed.sortValue === undefined) {
      throw new Error('Invalid cursor format');
    }

    return parsed;
  } catch (error) {
    throw new BadRequestException('Invalid cursor format');
  }
}

/**
 * Build Prisma where clause for cursor pagination
 */
export function buildCursorWhere(
  cursor: string | undefined,
  sortField: string = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc',
  additionalWhere?: any,
) {
  const baseWhere = additionalWhere || {};

  if (!cursor) {
    return baseWhere;
  }

  const { id, sortValue } = decodeCursor(cursor);

  // Build cursor condition based on sort direction
  const operator = sortDirection === 'desc' ? 'lt' : 'gt';

  return {
    ...baseWhere,
    OR: [
      // Items with sort value strictly greater/less than cursor
      {
        [sortField]: {
          [operator]: sortValue,
        },
      },
      // Items with same sort value but different ID (for stability)
      {
        [sortField]: sortValue,
        id: {
          [operator]: id,
        },
      },
    ],
  };
}

/**
 * Create paginated result with next cursor
 */
export function createPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number,
  sortField: string = 'createdAt',
  total?: number,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;

  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1];
    const sortValue = (lastItem as any)[sortField];
    nextCursor = encodeCursor(lastItem.id, sortValue);
  }

  return {
    data,
    nextCursor,
    hasMore,
    total,
  };
}

/**
 * Default pagination options
 */
export const DEFAULT_PAGINATION = {
  limit: 20,
  maxLimit: 100,
} as const;

/**
 * Validate and normalize pagination options
 */
export function validatePaginationOptions(options: CursorPaginationOptions) {
  const limit = Math.min(options.limit || DEFAULT_PAGINATION.limit, DEFAULT_PAGINATION.maxLimit);

  return {
    limit,
    cursor: options.cursor,
    sortField: options.sortField || 'createdAt',
    sortDirection: options.sortDirection || ('desc' as const),
  };
}
