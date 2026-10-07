/* eslint-disable @typescript-eslint/no-require-imports */
// Usage: node scripts/import-ffcs-inator.cjs <path-to-ffcs-repository>
// Reads public source data and writes our stable, normalized snapshot format.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const cp = require("node:child_process");
const ts = require("typescript");

const source = process.argv[2];
if (!source || !fs.existsSync(path.join(source, "src/data/faculty.ts"))) {
  console.error(
    "Pass a local checkout of https://github.com/CodeChefVIT/ffcs (prod branch).",
  );
  process.exit(1);
}
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const js = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: file,
  }).outputText;
  vm.runInNewContext(
    "(function(require,module,exports){" + js + "\n})",
    { console },
    { filename: file },
  )(
    (name) => {
      const base = path.resolve(path.dirname(file), name);
      return load(
        fs.existsSync(base + ".ts")
          ? base + ".ts"
          : path.join(base, "index.ts"),
      );
    },
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

const schools = load(path.join(source, "src/data/faculty.ts")).data;
const faculty = new Map();
const courses = new Map();
const offerings = new Map();
const clean = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");
const slug = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
for (const [school, categories] of Object.entries(schools)) {
  for (const [category, subjects] of Object.entries(categories)) {
    for (const [label, rows] of Object.entries(subjects)) {
      const match = /^([A-Z0-9]+)\s*-\s*(.+)$/.exec(clean(label));
      if (!match || !Array.isArray(rows)) continue;
      const [, code, title] = match;
      courses.set(code, {
        code,
        title,
        type: code.endsWith("P") ? "Lab" : "Theory",
      });
      for (const row of rows) {
        const name = clean(row.faculty);
        if (!name || /^(NIL|TBA|FACULTY|NOT ALLOTTED)$/i.test(name)) continue;
        const facultyId = slug(name);
        faculty.set(facultyId, { id: facultyId, name });
        const slot = clean(row.slot);
        const venue = clean(row.venue);
        const id = [
          code,
          facultyId,
          slot,
          venue,
          slug(school),
          slug(category),
        ].join("--");
        offerings.set(id, {
          id,
          courseCode: code,
          facultyId,
          slot,
          venue,
          school,
          category,
        });
      }
    }
  }
}
const commit = cp
  .execFileSync("git", ["-C", source, "rev-parse", "HEAD"], {
    encoding: "utf8",
  })
  .trim();
const commitDate = cp
  .execFileSync("git", ["-C", source, "show", "-s", "--format=%cs", "HEAD"], {
    encoding: "utf8",
  })
  .trim();
const output = {
  provenance: {
    kind: "imported-historical",
    label: "FFCS-inator public snapshot",
    sourceUrl: "https://github.com/CodeChefVIT/ffcs",
    branch: "prod",
    commit,
    commitDate,
    importedAt: new Date().toISOString(),
    currentAvailabilityConfirmed: false,
  },
  faculty: [...faculty.values()].sort((a, b) => a.name.localeCompare(b.name)),
  courses: [...courses.values()].sort((a, b) => a.code.localeCompare(b.code)),
  offerings: [...offerings.values()].sort((a, b) => a.id.localeCompare(b.id)),
};
const target = path.join(__dirname, "../src/data/ffcs-snapshot.json");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(output));
console.log(
  `Imported ${output.courses.length} courses, ${output.faculty.length} faculty and ${output.offerings.length} offerings from ${commit.slice(0, 7)} (${commitDate}).`,
);
