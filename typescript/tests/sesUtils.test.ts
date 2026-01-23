import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { formatAlertBody } from '../src/utils/sesUtils.js';
import type { WebsiteCheckResult } from '../src/types/index.js';

describe('sesUtils', () => {
  describe('formatAlertBody', () => {
    it('should format a single failed check correctly', () => {
      const failedChecks: WebsiteCheckResult[] = [
        {
          name: 'Test Site',
          url: 'https://example.com',
          success: false,
          statusCode: 500,
          error: 'Internal Server Error'
        }
      ];

      const body = formatAlertBody(failedChecks);

      expect(body).toContain('Website Availability Alert');
      expect(body).toContain('Timestamp:');
      expect(body).toContain('1. Test Site');
      expect(body).toContain('URL: https://example.com');
      expect(body).toContain('Status Code: 500');
      expect(body).toContain('Error: Internal Server Error');
      expect(body).toContain('automated alert');
    });

    it('should format multiple failed checks correctly', () => {
      const failedChecks: WebsiteCheckResult[] = [
        {
          name: 'Site A',
          url: 'https://sitea.com',
          success: false,
          statusCode: 404
        },
        {
          name: 'Site B',
          url: 'https://siteb.com',
          success: false,
          statusCode: 0,
          error: 'Connection refused'
        }
      ];

      const body = formatAlertBody(failedChecks);

      expect(body).toContain('1. Site A');
      expect(body).toContain('2. Site B');
      expect(body).toContain('Status Code: 404');
      expect(body).toContain('Status Code: N/A');
      expect(body).toContain('Error: Connection refused');
    });

    it('should handle empty array', () => {
      const body = formatAlertBody([]);

      expect(body).toContain('Website Availability Alert');
      expect(body).not.toContain('1.');
    });

    it('should handle check without error property', () => {
      const failedChecks: WebsiteCheckResult[] = [
        {
          name: 'Test Site',
          url: 'https://example.com',
          success: false,
          statusCode: 503
        }
      ];

      const body = formatAlertBody(failedChecks);

      expect(body).toContain('Status Code: 503');
      expect(body).not.toContain('Error:');
    });

    it('should show N/A for zero status code', () => {
      const failedChecks: WebsiteCheckResult[] = [
        {
          name: 'Test Site',
          url: 'https://example.com',
          success: false,
          statusCode: 0,
          error: 'Timeout'
        }
      ];

      const body = formatAlertBody(failedChecks);

      expect(body).toContain('Status Code: N/A');
    });
  });
});
