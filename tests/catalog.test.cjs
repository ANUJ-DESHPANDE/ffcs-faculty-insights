/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const snapshot = require("../src/data/ffcs-snapshot.json");
const fs = require('node:fs');
const path = require('node:path');

test("imported rows have valid references and distinct IDs", () => {
  const codes = new Set(snapshot.courses.map((row) => row.code));
  const ids = new Set(snapshot.faculty.map((row) => row.id));
  assert.equal(
    new Set(snapshot.offerings.map((row) => row.id)).size,
    snapshot.offerings.length,
  );
  for (const row of snapshot.offerings) {
    assert.ok(codes.has(row.courseCode));
    assert.ok(ids.has(row.facultyId));
  }
});

test("source snapshot is explicitly historical", () => {
  assert.equal(snapshot.provenance.currentAvailabilityConfirmed, false);
  assert.equal(snapshot.provenance.kind, "imported-historical");
  assert.match(snapshot.provenance.commit, /^[a-f0-9]{40}$/);
});

test("representative real course and faculty searches have matches", () => {
  const compact = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  assert.ok(
    snapshot.courses.some((course) =>
      compact(course.code).includes(compact("BCSE302L")),
    ),
  );
  assert.ok(
    snapshot.courses.some((course) =>
      compact(course.title).includes(compact("database")),
    ),
  );
  assert.ok(
    snapshot.faculty.some((item) =>
      compact(item.name).includes(compact("nalini")),
    ),
  );
});

test('review directory seed contains every historical faculty and course, without demo records', () => {
  const seed = fs.readFileSync(path.join(__dirname, '../supabase/seed.sql'), 'utf8');
  assert.equal((seed.match(/insert into public\.faculty_directory/g) ?? []).length, snapshot.faculty.length);
  assert.equal((seed.match(/insert into public\.course_directory/g) ?? []).length, snapshot.courses.length);
  assert.ok(seed.includes(snapshot.provenance.commit));
  assert.ok(!seed.includes('DEMO302L'));
});
