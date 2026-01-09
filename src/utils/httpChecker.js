import https from 'https';
import http from 'http';

/**
 * Checks if a website returns a 200 status code
 * @param {string} url - The URL to check
 * @returns {Promise<{success: boolean, statusCode: number, url: string, error?: string}>}
 */
export const checkWebsite = (url) => {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Website-Checker-Lambda/1.0'
        }
      };

      const req = protocol.request(options, (res) => {
        // Consume response data to free up memory
        res.on('data', () => {});

        res.on('end', () => {
          const isSuccess = res.statusCode === 200;
          resolve({
            success: isSuccess,
            statusCode: res.statusCode,
            url: url
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          statusCode: 0,
          url: url,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          statusCode: 0,
          url: url,
          error: 'Request timeout'
        });
      });

      req.end();
    } catch (error) {
      resolve({
        success: false,
        statusCode: 0,
        url: url,
        error: error.message
      });
    }
  });
};

/**
 * Checks multiple websites concurrently
 * @param {Array<{name: string, url: string}>} websites - Array of website objects
 * @returns {Promise<Array<{name: string, url: string, success: boolean, statusCode: number, error?: string}>>}
 */
export const checkMultipleWebsites = async (websites) => {
  const checks = websites.map(async (website) => {
    const result = await checkWebsite(website.url);
    return {
      name: website.name,
      ...result
    };
  });

  return Promise.all(checks);
};
