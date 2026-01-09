import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { checkMultipleWebsites } from '../utils/httpChecker.js';
import { sendAlert, formatAlertBody } from '../utils/sesUtils.js';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Lambda handler for checking website availability
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Promise<Object>} Response object with status and results
 */
export const handler = async (event, context) => {
  const startTime = Date.now();

  console.log('Website checker started', {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // Load websites from JSON file
    const websitesPath = join(__dirname, '../../websites.json');
    const websitesData = await readFile(websitesPath, 'utf-8');
    const { websites } = JSON.parse(websitesData);

    if (!websites || websites.length === 0) {
      console.warn('No websites found in websites.json');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No websites to check',
          checked: 0,
          failed: 0
        })
      };
    }

    console.log(`Checking ${websites.length} websites`);

    // Check all websites
    const results = await checkMultipleWebsites(websites);

    // Filter failed checks
    const failedChecks = results.filter(result => !result.success);
    const successfulChecks = results.filter(result => result.success);

    console.log('Check results:', {
      total: results.length,
      successful: successfulChecks.length,
      failed: failedChecks.length
    });

    // Log individual results
    results.forEach(result => {
      if (result.success) {
        console.log(`✓ ${result.name} (${result.url}): OK - Status ${result.statusCode}`);
      } else {
        console.error(`✗ ${result.name} (${result.url}): FAILED - Status ${result.statusCode}`, {
          error: result.error
        });
      }
    });

    // Send alert if there are failures
    if (failedChecks.length > 0) {
      const alertEmailFrom = process.env.ALERT_EMAIL_FROM;
      const alertEmailTo = process.env.ALERT_EMAIL_TO;

      if (!alertEmailFrom || !alertEmailTo) {
        console.error('Alert email addresses not configured. Set ALERT_EMAIL_FROM and ALERT_EMAIL_TO environment variables.');
      } else {
        try {
          const emailBody = formatAlertBody(failedChecks);
          await sendAlert({
            from: alertEmailFrom,
            to: alertEmailTo,
            subject: `Website Alert: ${failedChecks.length} site(s) down`,
            body: emailBody
          });
          console.log('Alert email sent successfully');
        } catch (error) {
          console.error('Failed to send alert email:', error);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Website checker completed in ${duration}ms`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Website check completed',
        checked: results.length,
        successful: successfulChecks.length,
        failed: failedChecks.length,
        duration: duration,
        results: results
      })
    };

  } catch (error) {
    console.error('Error in website checker:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error checking websites',
        error: error.message
      })
    };
  }
};
