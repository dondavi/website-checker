import { describe, it, expect } from '@jest/globals';
import { checkWebsite, checkMultipleWebsites } from '../src/utils/httpChecker.js';

describe('httpChecker', () => {
  describe('checkWebsite', () => {
    it('should return error for invalid URL', async () => {
      const result = await checkWebsite('invalid-url');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(0);
      expect(result.error).toBeDefined();
      expect(result.url).toBe('invalid-url');
    });

    it('should return error for malformed URL', async () => {
      const result = await checkWebsite('not a url at all');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(0);
      expect(result.error).toBeDefined();
    });

    it('should return error for empty URL', async () => {
      const result = await checkWebsite('');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(0);
      expect(result.error).toBeDefined();
    });

    // Integration tests - these hit real endpoints
    // Skip by default, run with: npm test -- --testNamePattern="integration"
    it.skip('integration: should return success for valid URL returning 200', async () => {
      const result = await checkWebsite('https://httpstat.us/200');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    }, 15000);

    it.skip('integration: should return failure for 404 response', async () => {
      const result = await checkWebsite('https://httpstat.us/404');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
    }, 15000);
  });

  describe('checkMultipleWebsites', () => {
    it('should return empty array for empty input', async () => {
      const results = await checkMultipleWebsites([]);
      expect(results).toHaveLength(0);
    });

    it('should include website name in results for invalid URLs', async () => {
      const websites = [
        { name: 'Invalid Site', url: 'not-a-valid-url' }
      ];

      const results = await checkMultipleWebsites(websites);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Invalid Site');
      expect(results[0].url).toBe('not-a-valid-url');
      expect(results[0].success).toBe(false);
    });

    it('should check multiple websites and preserve order', async () => {
      const websites = [
        { name: 'Site A', url: 'invalid-a' },
        { name: 'Site B', url: 'invalid-b' },
        { name: 'Site C', url: 'invalid-c' }
      ];

      const results = await checkMultipleWebsites(websites);

      expect(results).toHaveLength(3);
      expect(results[0].name).toBe('Site A');
      expect(results[1].name).toBe('Site B');
      expect(results[2].name).toBe('Site C');
    });
  });
});
