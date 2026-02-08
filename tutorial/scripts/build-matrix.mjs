import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const contentRoot = path.join(root, 'src', 'content');
const activeTutorialDir = path.join(contentRoot, 'tutorial');
const sourceRoot = path.join(root, 'sources');

const matrix = [
  { track: 'class', locale: 'zh-cn' },
  { track: 'class', locale: 'en' },
  { track: 'function', locale: 'zh-cn' },
  { track: 'function', locale: 'en' },
];
const pathPrefix = process.env.TUTORIAL_PATH_PREFIX || '/tutorial';

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

async function replaceDir(target, source) {
  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(source, target, { recursive: true });
}

async function main() {
  const backupRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tutorial-content-backup-'));
  const backupDir = path.join(backupRoot, 'tutorial');

  if (!(await fs.stat(activeTutorialDir).catch(() => null))) {
    throw new Error(`Missing active tutorial dir: ${activeTutorialDir}`);
  }

  await fs.cp(activeTutorialDir, backupDir, { recursive: true });
  await fs.rm(path.join(root, 'dist-matrix'), { recursive: true, force: true });

  try {
    for (const item of matrix) {
      const sourceDir = path.join(sourceRoot, item.track, item.locale, 'tutorial');
      const exists = await fs.stat(sourceDir).catch(() => null);
      if (!exists) {
        throw new Error(`Missing tutorial source: ${sourceDir}`);
      }

      await replaceDir(activeTutorialDir, sourceDir);

      const base = `${pathPrefix}/${item.track}/${item.locale}/`;
      const outDir = `dist-matrix/${item.track}/${item.locale}`;
      console.log(`\n== Building ${item.track}/${item.locale} ==`);
      console.log(`base=${base} outDir=${outDir}`);

      run('npm', ['run', 'astro', '--', 'build'], {
        TUTORIAL_BASE: base,
        TUTORIAL_OUTDIR: outDir,
      });
    }

    // Add a root index for /tutorial/ that redirects to class zh-cn by default.
    const normalizedPrefix = pathPrefix.endsWith('/') ? pathPrefix.slice(0, -1) : pathPrefix;
    const redirectTarget = `${normalizedPrefix}/class/zh-cn/`;
    const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${redirectTarget}" />
    <link rel="canonical" href="${redirectTarget}" />
    <title>Redirecting...</title>
  </head>
  <body>
    <a href="${redirectTarget}">Go to tutorial</a>
  </body>
</html>`;
    await fs.writeFile(path.join(root, 'dist-matrix', 'index.html'), indexHtml, 'utf8');
  } finally {
    await replaceDir(activeTutorialDir, backupDir);
    await fs.rm(backupRoot, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
