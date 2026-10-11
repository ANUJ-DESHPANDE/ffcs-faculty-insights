/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const loadTypescript = require('./load-typescript.cjs');
const modulePromise = loadTypescript(path.join(__dirname, '../src/lib/review-input.ts'));

const valid = {
  facultyId: 'known-faculty', courseCode: '', overall: 4, teaching: 4,
  grading: 3, workload: 2, labEase: null, wouldTakeAgain: true,
  comment: 'The lectures were clear, checking was fair, and the weekly work was manageable. I would choose this faculty again.',
  studiedUnderFaculty: true,
};

test('a detailed theory review passes without a lab rating', async () => {
  const { parseReviewInput } = await modulePromise;
  const result = parseReviewInput(valid);
  assert.ok('data' in result);
  assert.equal(result.data.labEase, null);
  assert.equal(result.data.courseCode, null);
});

test('core metrics and written account cannot be skipped', async () => {
  const { parseReviewInput } = await modulePromise;
  for (const key of ['overall', 'teaching', 'grading', 'workload', 'wouldTakeAgain', 'comment']) {
    const result = parseReviewInput({ ...valid, [key]: null });
    assert.ok('error' in result, `${key} should be required`);
  }
  assert.ok('error' in parseReviewInput({ ...valid, comment: 'Very nice teacher.' }));
  assert.ok('error' in parseReviewInput({ ...valid, studiedUnderFaculty: false }));
});

test('a chosen lab rating must be within one to five', async () => {
  const { parseReviewInput } = await modulePromise;
  assert.ok('error' in parseReviewInput({ ...valid, labEase: 7 }));
  assert.ok('data' in parseReviewInput({ ...valid, labEase: 5 }));
});
