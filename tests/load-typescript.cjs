/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const ts = require('typescript');

module.exports = function loadTypescript(path) {
  const source = fs.readFileSync(path, 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`;
  return import(dataUrl);
};
