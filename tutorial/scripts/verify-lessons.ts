/**
 * 逐课验证：模板 + 课程文件能否编译、启动，并且预览路径（默认 `/`）有响应。
 *
 * 用法：pnpm verify [class|function]
 * 每种写法只安装一次依赖，缓存在系统临时目录。
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContentLoader, LOCALES, TRACKS } from '../build/content.ts';
import type { ProjectFiles, Track } from '../src/types.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const cacheRoot = path.join(os.tmpdir(), 'midway-tutorial-verify');
const PORT = 7001;

async function writeProject(dir: string, files: ProjectFiles) {
  await fs.rm(dir, { recursive: true, force: true });
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(dir, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }
}

async function installDeps(track: Track, files: ProjectFiles) {
  const dir = path.join(cacheRoot, `deps-${track}`);
  const pkgPath = path.join(dir, 'package.json');
  const cached = await fs.readFile(pkgPath, 'utf8').catch(() => '');
  if (cached !== files['package.json']) {
    await writeProject(dir, { 'package.json': files['package.json'], '.npmrc': files['.npmrc'] ?? '' });
    console.log(`[${track}] installing dependencies...`);
    execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit' });
  }
  return path.join(dir, 'node_modules');
}

async function request(url: string, timeout: number) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      return res.status;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return 0;
}

/** tsc 有类型错误时仍会产出 JS，和在线环境里 mwtsc 的行为一致，所以只记录不中断。 */
function compile(dir: string, nodeModules: string) {
  try {
    execFileSync(path.join(nodeModules, '.bin', 'tsc'), ['-p', '.'], { cwd: dir, stdio: 'pipe' });
    return '';
  } catch (err: any) {
    return String(err.stdout || err.message);
  }
}

async function runLesson(dir: string, nodeModules: string, previewPath: string) {
  await fs.symlink(nodeModules, path.join(dir, 'node_modules'), 'dir');
  const typeErrors = compile(dir, nodeModules);

  const child = spawn(
    process.execPath,
    ['-e', 'process.send = () => {}; require("@midwayjs/mock/app.js")'],
    { cwd: dir, env: { ...process.env, NODE_ENV: 'local' }, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  let output = '';
  child.stdout.on('data', d => (output += d));
  child.stderr.on('data', d => (output += d));
  const exited = new Promise(r => child.once('exit', r));
  try {
    const status = await Promise.race([
      request(`http://127.0.0.1:${PORT}${previewPath}`, 15000),
      exited.then(() => 0),
    ]);
    return { status, output, typeErrors };
  } finally {
    child.kill();
    await exited;
  }
}

async function main() {
  if (await request(`http://127.0.0.1:${PORT}/`, 500)) {
    console.error(`Port ${PORT} is already in use, stop the process first.`);
    process.exit(1);
  }
  const only = process.argv[2] as Track | undefined;
  const loader = new ContentLoader(root);
  const failures: string[] = [];
  const warnings: string[] = [];
  let checked = 0;

  for (const track of TRACKS.filter(t => !only || t === only)) {
    for (const locale of LOCALES) {
      const variant = await loader.variant(track, locale);
      const nodeModules = await installDeps(track, variant.template);

      for (const part of variant.parts) {
        for (const lesson of part.lessons) {
          const id = `${track}/${locale}/${part.slug}/${lesson.slug}`;
          const dir = path.join(cacheRoot, 'lesson');
          const files = { ...variant.template, ...lesson.files };
          checked += 1;
          await writeProject(dir, files);
          const { status, output, typeErrors } = await runLesson(dir, nodeModules, lesson.preview);
          // 模板自带首页路由，所以每一课的预览地址都必须命中路由
          const ok = status >= 200 && status < 500 && status !== 404;
          const note = typeErrors ? ', type errors' : '';
          const result = `GET ${lesson.preview} -> ${status || 'no response'}${note}`;
          console.log(`${ok ? 'PASS' : 'FAIL'} ${id} (${result})`);
          if (!ok) failures.push(`${id}\n${output.slice(-1500)}`);
          if (typeErrors) warnings.push(`${id}\n${typeErrors}`);
        }
      }
    }
  }

  console.log(
    `\nChecked ${checked} lessons, ${failures.length} failed, ${warnings.length} with type errors.`
  );
  if (warnings.length) {
    console.log('\nType errors:\n' + warnings.join('\n'));
  }
  if (failures.length) {
    console.log('\n' + failures.join('\n\n'));
    process.exit(1);
  }
}

main();
