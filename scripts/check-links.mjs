import { readdir, readFile, access } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.name.endsWith('.html')) result.push(path);
  }
  return result;
}

const broken = [];
for (const file of await walk('.')) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const value = match[1];
    if (/^(https?:|data:)/.test(value)) continue;
    const path = normalize(join(dirname(file), value.split('?')[0]));
    try { await access(path); }
    catch { broken.push(`${file}: ${value}`); }
  }
}
if (broken.length) {
  console.error(broken.join('\n'));
  process.exit(1);
}
console.log('Enlaces internos correctos.');
