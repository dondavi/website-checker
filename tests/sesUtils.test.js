import { test } from 'node:test';
import assert from 'node:assert';
import { formatAlertBody } from '../src/utils/sesUtils.js';

test('sesUtils - formatAlertBody should format single failed check', () => {
  const failedChecks = [
    {
      name: 'Test Site',
      url: 'https://example.com',
      statusCode: 500,
      error: 'Internal Server Error'
    }
  ];

  const body = formatAlertBody(failedChecks);

  assert.ok(body.includes('Test Site'), 'Should include site name');
  assert.ok(body.includes('https://example.com'), 'Should include URL');
  assert.ok(body.includes('500'), 'Should include status code');
  assert.ok(body.includes('Internal Server Error'), 'Should include error message');
  assert.ok(body.includes('Website Availability Alert'), 'Should include alert header');
});

test('sesUtils - formatAlertBody should format multiple failed checks', () => {
  const failedChecks = [
    {
      name: 'Site One',
      url: 'https://example1.com',
      statusCode: 404
    },
    {
      name: 'Site Two',
      url: 'https://example2.com',
      statusCode: 503,
      error: 'Service Unavailable'
    }
  ];

  const body = formatAlertBody(failedChecks);

  assert.ok(body.includes('Site One'), 'Should include first site');
  assert.ok(body.includes('Site Two'), 'Should include second site');
  assert.ok(body.includes('404'), 'Should include first status code');
  assert.ok(body.includes('503'), 'Should include second status code');
  assert.ok(body.includes('1.'), 'Should include numbering');
  assert.ok(body.includes('2.'), 'Should include second number');
});

test('sesUtils - formatAlertBody should handle check without error message', () => {
  const failedChecks = [
    {
      name: 'Test Site',
      url: 'https://example.com',
      statusCode: 301
    }
  ];

  const body = formatAlertBody(failedChecks);

  assert.ok(body.includes('Test Site'), 'Should include site name');
  assert.ok(body.includes('301'), 'Should include status code');
  assert.ok(!body.includes('Error:'), 'Should not include error section when no error');
});

test('sesUtils - formatAlertBody should include timestamp', () => {
  const failedChecks = [
    {
      name: 'Test Site',
      url: 'https://example.com',
      statusCode: 500
    }
  ];

  const body = formatAlertBody(failedChecks);

  assert.ok(body.includes('Timestamp:'), 'Should include timestamp');
  assert.ok(/\d{4}-\d{2}-\d{2}/.test(body), 'Should include date in ISO format');
});
