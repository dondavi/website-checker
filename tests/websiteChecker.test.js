import { test } from 'node:test';
import assert from 'node:assert';
import { handler } from '../src/handlers/websiteChecker.js';

// Mock context object
const mockContext = {
  requestId: 'test-request-id',
  functionName: 'website-checker',
  awsRequestId: 'test-aws-request-id'
};

test('websiteChecker handler - should process websites and return results', async () => {
  const event = {};

  const response = await handler(event, mockContext);

  assert.strictEqual(response.statusCode, 200, 'Should return 200 status');
  assert.ok(response.body, 'Should have body in response');

  const body = JSON.parse(response.body);
  assert.ok(body.message, 'Body should have message');
  assert.strictEqual(typeof body.checked, 'number', 'Body should have checked count');
  assert.strictEqual(typeof body.successful, 'number', 'Body should have successful count');
  assert.strictEqual(typeof body.failed, 'number', 'Body should have failed count');
});

test('websiteChecker handler - should include duration in response', async () => {
  const event = {};

  const response = await handler(event, mockContext);
  const body = JSON.parse(response.body);

  assert.strictEqual(typeof body.duration, 'number', 'Should include duration');
  assert.ok(body.duration >= 0, 'Duration should be non-negative');
});

test('websiteChecker handler - should include results array', async () => {
  const event = {};

  const response = await handler(event, mockContext);
  const body = JSON.parse(response.body);

  assert.ok(Array.isArray(body.results), 'Should include results array');
  assert.strictEqual(body.results.length, body.checked, 'Results length should match checked count');
});

test('websiteChecker handler - results should have required properties', async () => {
  const event = {};

  const response = await handler(event, mockContext);
  const body = JSON.parse(response.body);

  if (body.results.length > 0) {
    const result = body.results[0];
    assert.ok(result.hasOwnProperty('name'), 'Result should have name');
    assert.ok(result.hasOwnProperty('url'), 'Result should have url');
    assert.ok(result.hasOwnProperty('success'), 'Result should have success');
    assert.ok(result.hasOwnProperty('statusCode'), 'Result should have statusCode');
  }
});
