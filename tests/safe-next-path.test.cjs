/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadTypescript = require('./load-typescript.cjs');
const modulePromise = loadTypescript(path.join(__dirname, '../src/lib/safe-next-path.ts'));

test('auth callback accepts only local destinations', async () => {
  const { safeNextPath } = await modulePromise;
  assert.equal(safeNextPath('/review/faculty-id?step=2'), '/review/faculty-id?step=2');
  for (const value of ['https://evil.com', '//evil.com', '/\\evil.com', null])
    assert.equal(safeNextPath(value), '/contribute');
});
