import { test } from 'node:test';
import assert from 'node:assert';
import { checkWebsite, checkMultipleWebsites } from '../src/utils/httpChecker.js';

test('httpChecker - checkWebsite should return success for valid URL', async () => {
  const result = await checkWebsite('https://www.google.com');

  assert.strictEqual(typeof result, 'object', 'Result should be an object');
  assert.strictEqual(typeof result.success, 'boolean', 'Result should have success property');
  assert.strictEqual(typeof result.statusCode, 'number', 'Result should have statusCode property');
  assert.strictEqual(result.url, 'https://www.google.com', 'Result should have correct URL');
});

test('httpChecker - checkWebsite should handle invalid URL', async () => {
  const result = await checkWebsite('https://this-domain-definitely-does-not-exist-12345.com');

  assert.strictEqual(result.success, false, 'Should fail for invalid domain');
  assert.ok(result.error, 'Should include error message');
});

test('httpChecker - checkWebsite should handle malformed URL', async () => {
  const result = await checkWebsite('not-a-valid-url');

  assert.strictEqual(result.success, false, 'Should fail for malformed URL');
  assert.ok(result.error, 'Should include error message');
});

test('httpChecker - checkMultipleWebsites should check multiple sites', async () => {
  const websites = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Invalid', url: 'https://this-does-not-exist-12345.com' }
  ];

  const results = await checkMultipleWebsites(websites);

  assert.strictEqual(results.length, 2, 'Should return results for all websites');
  assert.strictEqual(results[0].name, 'Google', 'First result should be Google');
  assert.strictEqual(results[1].name, 'Invalid', 'Second result should be Invalid');
  assert.ok(results[0].hasOwnProperty('success'), 'Results should have success property');
});

test('httpChecker - checkMultipleWebsites should handle empty array', async () => {
  const websites = [];
  const results = await checkMultipleWebsites(websites);

  assert.strictEqual(results.length, 0, 'Should return empty array for empty input');
});
