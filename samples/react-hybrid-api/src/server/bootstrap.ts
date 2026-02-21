import { Bootstrap } from '@midwayjs/bootstrap';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const appDir = dirname(fileURLToPath(import.meta.url));

export async function start() {
  await Bootstrap.configure({
    baseDir: appDir,
  }).run();
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isDirectRun()) {
  start().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
