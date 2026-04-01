import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const [, , track, locale] = process.argv;

const validTracks = new Set(['class', 'function']);
const validLocales = new Set(['zh-cn', 'en']);

function usage() {
  console.log('Usage: npm run use -- <class|function> <zh-cn|en>');
  console.log('Example: npm run use -- function zh-cn');
}

if (!validTracks.has(track) || !validLocales.has(locale)) {
  usage();
  process.exit(1);
}

const sourceDir = path.join(root, 'sources', track, locale, 'tutorial');
const targetDir = path.join(root, 'src', 'content', 'tutorial');

const exists = await fs.stat(sourceDir).catch(() => null);
if (!exists) {
  console.error(`Source not found: ${sourceDir}`);
  process.exit(1);
}

await fs.rm(targetDir, { recursive: true, force: true });
await fs.cp(sourceDir, targetDir, { recursive: true });

console.log(`Switched tutorial source to: ${track}/${locale}`);
console.log(`- Source: ${sourceDir}`);
console.log(`- Target: ${targetDir}`);
