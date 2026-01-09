import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client outside handler for reuse (warm start optimization)
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Sends an email alert via AWS SES
 * @param {Object} params - Email parameters
 * @param {string} params.from - Sender email address
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body (plain text)
 * @returns {Promise<Object>} SES response
 */
export const sendAlert = async ({ from, to, subject, body }) => {
  const command = new SendEmailCommand({
    Source: from,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Text: {
          Data: body,
          Charset: 'UTF-8'
        }
      }
    }
  });

  try {
    const response = await sesClient.send(command);
    return {
      success: true,
      messageId: response.MessageId
    };
  } catch (error) {
    console.error('Failed to send email alert:', error);
    throw error;
  }
};

/**
 * Formats failed website checks into an email body
 * @param {Array<Object>} failedChecks - Array of failed check results
 * @returns {string} Formatted email body
 */
export const formatAlertBody = (failedChecks) => {
  const timestamp = new Date().toISOString();
  let body = `Website Availability Alert\n`;
  body += `Timestamp: ${timestamp}\n\n`;
  body += `The following websites are not responding with a 200 status:\n\n`;

  failedChecks.forEach((check, index) => {
    body += `${index + 1}. ${check.name}\n`;
    body += `   URL: ${check.url}\n`;
    body += `   Status Code: ${check.statusCode || 'N/A'}\n`;
    if (check.error) {
      body += `   Error: ${check.error}\n`;
    }
    body += `\n`;
  });

  body += `\nThis is an automated alert from the Website-Checker Lambda function.\n`;

  return body;
};
