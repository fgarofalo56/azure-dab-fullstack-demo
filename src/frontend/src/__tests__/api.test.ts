/**
 * API Utilities Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildODataQuery,
  formatNumber,
  formatCurrency,
  formatDate,
  fetchFromApi,
  executeGraphQL,
} from '../utils/api';

describe('buildODataQuery', () => {
  // Note: DAB uses $first instead of $top, and doesn't support $skip or $count
  // These tests match the actual DAB implementation

  it('returns empty string for no params', () => {
    expect(buildODataQuery({})).toBe('');
  });

  it('builds query with top (DAB uses $first)', () => {
    const query = buildODataQuery({ top: 10 });
    expect(query).toContain('$first=10');
  });

  it('ignores skip (DAB uses cursor-based pagination)', () => {
    // DAB doesn't support $skip - it uses cursor-based pagination with $after
    const query = buildODataQuery({ skip: 20 });
    expect(query).not.toContain('$skip');
  });

  it('builds query with orderBy', () => {
    const query = buildODataQuery({ orderBy: 'name desc' });
    expect(query).toContain('$orderby=name%20desc');
  });

  it('builds query with filter', () => {
    const query = buildODataQuery({ filter: "state eq 'CA'" });
    expect(query).toContain('$filter=');
  });

  it('combines multiple params', () => {
    const query = buildODataQuery({ top: 10, skip: 20, orderBy: 'name' });
    expect(query).toContain('$first=10');
    expect(query).toContain('$orderby=name');
    // DAB doesn't support $count=true
    expect(query).not.toContain('$count');
    // DAB doesn't support $skip
    expect(query).not.toContain('$skip');
  });
});

describe('formatNumber', () => {
  it('returns dash for null', () => {
    expect(formatNumber(null)).toBe('-');
  });

  it('returns dash for undefined', () => {
    expect(formatNumber(undefined)).toBe('-');
  });

  it('formats small numbers', () => {
    expect(formatNumber(123)).toBe('123');
  });

  it('formats large numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatCurrency', () => {
  it('returns dash for null', () => {
    expect(formatCurrency(null)).toBe('-');
  });

  it('returns dash for undefined', () => {
    expect(formatCurrency(undefined)).toBe('-');
  });

  it('formats as USD', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234.56');
  });

  it('formats compact millions', () => {
    expect(formatCurrency(5000000, true)).toBe('$5.0M');
  });

  it('formats compact billions', () => {
    expect(formatCurrency(2500000000, true)).toBe('$2.5B');
  });

  it('formats compact thousands', () => {
    expect(formatCurrency(75000, true)).toBe('$75.0K');
  });
});

describe('formatDate', () => {
  it('returns dash for null', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('returns dash for undefined', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('formats date string', () => {
    const result = formatDate('2024-03-15');
    // Date formatting depends on timezone; check for Mar and 2024
    expect(result).toMatch(/Mar.*2024/);
  });
});

describe('fetchFromApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('makes GET request with authorization header', async () => {
    const mockResponse = { value: [{ id: 1, name: 'Test' }] };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchFromApi('/Category', 'test-token');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/Category',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('throws error on non-ok response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not found'),
    });

    await expect(fetchFromApi('/NotFound', 'test-token')).rejects.toThrow(
      'API Error (404): Not found'
    );
  });

  it('sends POST request with body', async () => {
    const mockResponse = { value: [{ id: 1 }] };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await fetchFromApi(
      '/Category',
      'test-token',
      { method: 'POST', body: { name: 'New Category' } }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/Category',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Category' }),
      })
    );
  });
});

describe('executeGraphQL', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends GraphQL query', async () => {
    const mockResponse = { data: { categories: { items: [] } } };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const query = '{ categories { items { id name } } }';
    const result = await executeGraphQL(query, {}, 'test-token');

    expect(global.fetch).toHaveBeenCalledWith(
      '/graphql',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query, variables: {} }),
      })
    );
    expect(result).toEqual({ categories: { items: [] } });
  });

  it('throws on GraphQL errors', async () => {
    const mockResponse = {
      errors: [{ message: 'Field not found' }],
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await expect(
      executeGraphQL('{ invalid }', {}, 'test-token')
    ).rejects.toThrow('GraphQL Error: Field not found');
  });
});
