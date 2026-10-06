/**
 * 逐课验证：模板 + 课程文件能否编译、启动，并且预览路径（默认 `/`）命中路由。
 * 有 `_solution` 的课程会再验证一次答案，并检查 frontmatter `checks` 里的路径；
 * 声明了 `test: true` 的课程还会执行 `npm test`。
 *
 * 用法：pnpm verify [class|function] [课程路径关键字]
 * 每种写法只安装一次依赖，缓存在系统临时目录。
 */
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
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

/** 课程可以覆盖 `package.json`（例如测试课需要 jest），按内容分别缓存依赖。 */
async function installDeps(track: Track, files: ProjectFiles) {
  const hash = createHash('sha1').update(files['package.json']).digest('hex').slice(0, 8);
  const dir = path.join(cacheRoot, `deps-${track}-${hash}`);
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

/** 路由存在即可：业务上的 4xx（如参数校验失败）也算命中，只有 404 和 5xx 视为失败。 */
function hit(status: number) {
  return status >= 200 && status < 500 && status !== 404;
}

async function runLesson(dir: string, nodeModules: string, paths: string[]) {
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
  const results: Array<{ path: string; status: number }> = [];
  try {
    for (const [index, target] of paths.entries()) {
      const status = await Promise.race([
        request(`http://127.0.0.1:${PORT}${target}`, index === 0 ? 15000 : 3000),
        exited.then(() => 0),
      ]);
      results.push({ path: target, status });
    }
    return { results, output, typeErrors };
  } finally {
    child.kill();
    await exited;
  }
}

function runTests(dir: string) {
  try {
    execFileSync('npm', ['test'], { cwd: dir, stdio: 'pipe', timeout: 120000 });
    return '';
  } catch (err: any) {
    return String(err.stdout || '') + String(err.stderr || err.message);
  }
}

async function main() {
  if (await request(`http://127.0.0.1:${PORT}/`, 500)) {
    console.error(`Port ${PORT} is already in use, stop the process first.`);
    process.exit(1);
  }
  const only = process.argv[2] as Track | undefined;
  const filter = process.argv[3];
  const loader = new ContentLoader(root);
  const failures: string[] = [];
  const warnings: string[] = [];
  let checked = 0;

  for (const track of TRACKS.filter(t => !only || t === only)) {
    for (const locale of LOCALES) {
      const variant = await loader.variant(track, locale);

      for (const part of variant.parts) {
        for (const lesson of part.lessons) {
          const id = `${track}/${locale}/${part.slug}/${lesson.slug}`;
          if (filter && !id.includes(filter)) continue;
          const checks = loader.checks(lesson);
          const start = { ...variant.template, ...lesson.files };
          const states = [{ name: 'start', files: start, paths: [lesson.preview] }];
          if (lesson.solution) {
            states.push({
              name: 'solution',
              files: { ...start, ...lesson.solution },
              paths: [lesson.preview, ...checks.paths],
            });
          } else {
            states[0].paths.push(...checks.paths);
          }

          for (const [index, state] of states.entries()) {
            const label = `${id} [${state.name}]`;
            const dir = path.join(cacheRoot, 'lesson');
            checked += 1;
            const nodeModules = await installDeps(track, state.files);
            await writeProject(dir, state.files);
            const { results, output, typeErrors } = await runLesson(dir, nodeModules, state.paths);
            let ok = results.every(r => hit(r.status));
            let detail = output.slice(-1500);
            const isLast = index === states.length - 1;
            if (ok && checks.test && isLast) {
              const testOutput = runTests(dir);
              if (testOutput) {
                ok = false;
                detail = `npm test failed:\n${testOutput.slice(-2000)}`;
              }
            }
            const summary = results.map(r => `GET ${r.path} -> ${r.status || 'no response'}`);
            if (checks.test && isLast) summary.push('npm test');
            const note = typeErrors ? ', type errors' : '';
            console.log(`${ok ? 'PASS' : 'FAIL'} ${label} (${summary.join(', ')}${note})`);
            if (!ok) failures.push(`${label}\n${detail}`);
            if (typeErrors) warnings.push(`${label}\n${typeErrors}`);
          }
        }
      }
    }
  }

  console.log(
    `\nChecked ${checked} lesson states, ${failures.length} failed, ${warnings.length} with type errors.`
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
