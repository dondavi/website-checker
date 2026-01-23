import https from 'https';
import http, { IncomingMessage } from 'http';
import type { Website, RawCheckResult, WebsiteCheckResult } from '../types/index.js';

const REQUEST_TIMEOUT = 12000;
const USER_AGENT = 'Website-Checker-Lambda/1.0';

/**
 * Checks if a website returns a 200 status code
 * @param url - The URL to check
 * @returns Promise with the check result
 */
export const checkWebsite = (url: string): Promise<RawCheckResult> => {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options: http.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || undefined,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: REQUEST_TIMEOUT,
        headers: {
          'User-Agent': USER_AGENT
        }
      };

      const req = protocol.request(options, (res: IncomingMessage) => {
        // Consume response data to free up memory
        res.on('data', () => {});

        res.on('end', () => {
          const statusCode = res.statusCode ?? 0;
          const isSuccess = statusCode === 200;
          resolve({
            success: isSuccess,
            statusCode,
            url
          });
        });
      });

      req.on('error', (error: Error) => {
        resolve({
          success: false,
          statusCode: 0,
          url,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          statusCode: 0,
          url,
          error: 'Request timeout'
        });
      });

      req.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      resolve({
        success: false,
        statusCode: 0,
        url,
        error: errorMessage
      });
    }
  });
};

/**
 * Checks multiple websites concurrently
 * @param websites - Array of website objects
 * @returns Promise with array of check results
 */
export const checkMultipleWebsites = async (
  websites: Website[]
): Promise<WebsiteCheckResult[]> => {
  const checks = websites.map(async (website): Promise<WebsiteCheckResult> => {
    const result = await checkWebsite(website.url);
    return {
      name: website.name,
      ...result
    };
  });

  return Promise.all(checks);
};
