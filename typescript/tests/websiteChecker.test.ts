import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { Context, ScheduledEvent } from 'aws-lambda';

// Mock the modules before importing the handler
jest.unstable_mockModule('../src/utils/httpChecker.js', () => ({
  checkMultipleWebsites: jest.fn()
}));

jest.unstable_mockModule('../src/utils/sesUtils.js', () => ({
  sendAlert: jest.fn(),
  formatAlertBody: jest.fn()
}));

jest.unstable_mockModule('fs/promises', () => ({
  readFile: jest.fn()
}));

describe('websiteChecker handler', () => {
  let handler: typeof import('../src/handlers/websiteChecker.js').handler;
  let mockCheckMultipleWebsites: jest.MockedFunction<typeof import('../src/utils/httpChecker.js').checkMultipleWebsites>;
  let mockSendAlert: jest.MockedFunction<typeof import('../src/utils/sesUtils.js').sendAlert>;
  let mockFormatAlertBody: jest.MockedFunction<typeof import('../src/utils/sesUtils.js').formatAlertBody>;
  let mockReadFile: jest.MockedFunction<typeof import('fs/promises').readFile>;

  const mockContext: Context = {
    awsRequestId: 'test-request-id',
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:test',
    logGroupName: '/aws/lambda/test',
    logStreamName: '2024/01/01/[$LATEST]test',
    memoryLimitInMB: '256',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };

  const mockEvent: ScheduledEvent = {
    version: '0',
    id: 'test-event-id',
    'detail-type': 'Scheduled Event',
    source: 'aws.events',
    account: '123456789',
    time: new Date().toISOString(),
    region: 'us-east-1',
    resources: ['arn:aws:events:us-east-1:123456789:rule/test-rule'],
    detail: {}
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Import mocked modules
    const httpCheckerModule = await import('../src/utils/httpChecker.js');
    const sesUtilsModule = await import('../src/utils/sesUtils.js');
    const fsModule = await import('fs/promises');

    mockCheckMultipleWebsites = httpCheckerModule.checkMultipleWebsites as jest.MockedFunction<typeof httpCheckerModule.checkMultipleWebsites>;
    mockSendAlert = sesUtilsModule.sendAlert as jest.MockedFunction<typeof sesUtilsModule.sendAlert>;
    mockFormatAlertBody = sesUtilsModule.formatAlertBody as jest.MockedFunction<typeof sesUtilsModule.formatAlertBody>;
    mockReadFile = fsModule.readFile as jest.MockedFunction<typeof fsModule.readFile>;

    // Import handler after mocks are set up
    const handlerModule = await import('../src/handlers/websiteChecker.js');
    handler = handlerModule.handler;
  });

  it('should return success response when all websites are healthy', async () => {
    const websitesJson = JSON.stringify({
      websites: [
        { name: 'Test', url: 'https://test.com' }
      ]
    });

    mockReadFile.mockResolvedValue(websitesJson);
    mockCheckMultipleWebsites.mockResolvedValue([
      { name: 'Test', url: 'https://test.com', success: true, statusCode: 200 }
    ]);

    const result = await handler(mockEvent, mockContext);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.message).toBe('Website check completed');
    expect(body.checked).toBe(1);
    expect(body.successful).toBe(1);
    expect(body.failed).toBe(0);
  });

  it('should send alert when websites fail', async () => {
    process.env.ALERT_EMAIL_FROM = 'from@test.com';
    process.env.ALERT_EMAIL_TO = 'to@test.com';

    const websitesJson = JSON.stringify({
      websites: [
        { name: 'Failing Site', url: 'https://failing.com' }
      ]
    });

    mockReadFile.mockResolvedValue(websitesJson);
    mockCheckMultipleWebsites.mockResolvedValue([
      { name: 'Failing Site', url: 'https://failing.com', success: false, statusCode: 500 }
    ]);
    mockFormatAlertBody.mockReturnValue('Alert body');
    mockSendAlert.mockResolvedValue({ success: true, messageId: 'test-id' });

    const result = await handler(mockEvent, mockContext);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.failed).toBe(1);
    expect(mockSendAlert).toHaveBeenCalledWith({
      from: 'from@test.com',
      to: 'to@test.com',
      subject: 'Website Alert: 1 site(s) down',
      body: 'Alert body'
    });

    delete process.env.ALERT_EMAIL_FROM;
    delete process.env.ALERT_EMAIL_TO;
  });

  it('should return empty response when no websites configured', async () => {
    const websitesJson = JSON.stringify({ websites: [] });
    mockReadFile.mockResolvedValue(websitesJson);

    const result = await handler(mockEvent, mockContext);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.message).toBe('No websites to check');
    expect(body.checked).toBe(0);
  });

  it('should return error response on exception', async () => {
    mockReadFile.mockRejectedValue(new Error('File not found'));

    const result = await handler(mockEvent, mockContext);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(500);
    expect(body.message).toBe('Error checking websites');
    expect(body.error).toBe('File not found');
  });
});
