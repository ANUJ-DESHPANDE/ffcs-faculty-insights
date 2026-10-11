/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const snapshot = require(path.join(root, 'src/data/ffcs-snapshot.json'));
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const lines = [
  '-- Generated from the historical FFCS-inator snapshot. Do not treat as current availability.',
  `-- Source: ${snapshot.provenance.sourceUrl} at ${snapshot.provenance.commit}`,
  '-- The original MIT license is in docs/third-party/FFCS-INATOR-LICENSE.txt.',
  'begin;',
];

for (const row of snapshot.faculty) {
  lines.push(`insert into public.faculty_directory (id, name) values (${quote(row.id)}, ${quote(row.name)}) on conflict (id) do update set name = excluded.name;`);
}
for (const row of snapshot.courses) {
  lines.push(`insert into public.course_directory (code, title, course_type) values (${quote(row.code)}, ${quote(row.title)}, ${quote(row.type)}) on conflict (code) do update set title = excluded.title, course_type = excluded.course_type;`);
}
lines.push('commit;', '');
const target = path.join(root, 'supabase/seed.sql');
fs.writeFileSync(target, lines.join('\n'));
console.log(`Wrote ${snapshot.faculty.length} faculty and ${snapshot.courses.length} courses to ${target}`);
