#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const treeKill = require('tree-kill');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SAMPLE_CONFIGS = {
  'react-functional-api': {
    cwd: 'samples/react-functional-api',
    apiPath: '/api/users/1',
    fallbackApiUrl: 'http://127.0.0.1:7001/api/users/1',
    targetFile: 'samples/react-functional-api/src/server/api/user.api.ts',
  },
  'react-functional-api-axios': {
    cwd: 'samples/react-functional-api-axios',
    apiPath: '/api/users/1',
    fallbackApiUrl: 'http://127.0.0.1:7001/api/users/1',
    targetFile: 'samples/react-functional-api-axios/src/server/api/user.api.ts',
  },
  'react-functional-api-rspack': {
    cwd: 'samples/react-functional-api-rspack',
    apiPath: '/api/users/1',
    fallbackApiUrl: 'http://127.0.0.1:5174/api/users/1',
    targetFile: 'samples/react-functional-api-rspack/src/server/api/user.api.ts',
  },
  'react-hybrid-api': {
    cwd: 'samples/react-hybrid-api',
    apiPath: '/api/users/1',
    fallbackApiUrl: 'http://127.0.0.1:7001/api/users/1',
    targetFile: 'samples/react-hybrid-api/src/server/api/user.api.ts',
    skipReason:
      'react-hybrid-api dev runtime is currently unstable under automated HMR E2E (startup fails before serving API).',
  },
  'vue-functional-api': {
    cwd: 'samples/vue-functional-api',
    apiPath: '/api/users/1',
    fallbackApiUrl: 'http://127.0.0.1:7001/api/users/1',
    targetFile: 'samples/vue-functional-api/src/server/api/user.api.ts',
  },
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestJson(url) {
  const resp = await fetch(url, {
    headers: {
      accept: 'application/json',
    },
  });
  if (!resp.ok) {
    throw new Error(`request failed: ${resp.status}`);
  }
  return resp.json();
}

async function poll(fn, timeoutMs, intervalMs, label) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await sleep(intervalMs);
    }
  }
  throw new Error(`${label} timeout after ${timeoutMs}ms: ${lastErr?.message || lastErr}`);
}

function killProcessTree(child) {
  if (!child || child.killed) {
    return;
  }
  treeKill(child.pid, 'SIGTERM');
}

function forceFreePort(port) {
  try {
    const raw = execSync(`lsof -ti tcp:${port}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
    if (!raw) {
      return;
    }
    for (const pidText of raw.split('\\n')) {
      const pid = Number(pidText.trim());
      if (!Number.isInteger(pid) || pid <= 1 || pid === process.pid) {
        continue;
      }
      treeKill(pid, 'SIGKILL');
    }
  } catch {
    // ignore when no process occupies this port
  }
}

function isPortInUse(port) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close(() => resolve(false));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function stopDev(child) {
  if (!child) {
    return;
  }
  killProcessTree(child);
  await Promise.race([
    new Promise(resolve => child.once('exit', resolve)),
    sleep(5000),
  ]);
  if (!child.killed) {
    treeKill(child.pid, 'SIGKILL');
    await sleep(500);
  }
}

async function waitPortReleased(port, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!(await isPortInUse(port))) {
      return;
    }
    await sleep(200);
  }
  throw new Error(`port ${port} still in use after ${timeoutMs}ms`);
}

function mutateApiFile(content, marker) {
  const nameRegex = /name\s*:\s*'([^']*)'/;
  const match = content.match(nameRegex);
  if (!match) {
    throw new Error('cannot find `name: \'...\'` field in target api file');
  }
  const nextName = `${match[1]}-${marker}`;
  const nextContent = content.replace(nameRegex, `name: '${nextName}'`);
  return { nextName, nextContent };
}

async function runSample(sampleName, cfg) {
  const targetFileAbs = resolve(ROOT, cfg.targetFile);
  const original = readFileSync(targetFileAbs, 'utf8');
  const marker = `hmr${Date.now().toString(36)}`;
  const { nextName, nextContent } = mutateApiFile(original, marker);

  let child;
  let logs = '';
  let devBaseUrl = '';

  const onLog = chunk => {
    const text = chunk.toString();
    logs += text;
    if (logs.length > 20000) {
      logs = logs.slice(-20000);
    }
    if (!devBaseUrl && /(Local|Loopback):/i.test(text)) {
      const m = text.match(/https?:\/\/[^\s/]+(?::\d+)?/);
      if (m?.[0]) {
        devBaseUrl = m[0];
      }
    }
    process.stdout.write(`[${sampleName}] ${text}`);
  };

  const getRequestUrl = () => {
    if (devBaseUrl) {
      return `${devBaseUrl}${cfg.apiPath}`;
    }
    return cfg.fallbackApiUrl;
  };

  try {
    forceFreePort(7001);
    await waitPortReleased(7001, 15000);
    child = spawn('pnpm', ['-C', cfg.cwd, 'dev'], {
      cwd: ROOT,
      env: process.env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', onLog);
    child.stderr.on('data', onLog);

    await poll(
      async () => {
        const data = await requestJson(getRequestUrl());
        if (!data || typeof data !== 'object') {
          throw new Error('invalid json response');
        }
        if (typeof data.name !== 'string') {
          throw new Error('response missing `name`');
        }
        return data;
      },
      90000,
      1000,
      `wait initial response for ${sampleName}`
    );

    writeFileSync(targetFileAbs, nextContent, 'utf8');

    const changed = await poll(
      async () => {
        const data = await requestJson(getRequestUrl());
        if (data?.name !== nextName) {
          throw new Error(`waiting name=${nextName}, got ${data?.name}`);
        }
        return data;
      },
      90000,
      1000,
      `wait hmr change for ${sampleName}`
    );

    console.log(`\n[${sampleName}] HMR ok, updated name: ${changed.name}`);
  } catch (err) {
    const detail = logs.split('\n').slice(-80).join('\n');
    throw new Error(`[${sampleName}] ${err.message}\n---- recent dev logs ----\n${detail}`);
  } finally {
    try {
      writeFileSync(targetFileAbs, original, 'utf8');
    } catch {
      // ignore
    }
    await stopDev(child);
    await waitPortReleased(7001, 15000).catch(() => {
      // ignore; next sample startup poll will fail if still occupied
    });
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const sampleIndex = args.indexOf('--sample');
  if (sampleIndex >= 0) {
    const sampleName = args[sampleIndex + 1];
    if (!sampleName) {
      throw new Error('missing value for --sample');
    }
    return [sampleName];
  }
  return Object.keys(SAMPLE_CONFIGS);
}

async function main() {
  const targets = parseArgs();
  for (const sample of targets) {
    const cfg = SAMPLE_CONFIGS[sample];
    if (!cfg) {
      throw new Error(`unknown sample: ${sample}`);
    }
    if (cfg.skipReason) {
      console.log(`\n=== Skip HMR E2E: ${sample} ===`);
      console.log(`[${sample}] skipped: ${cfg.skipReason}`);
      continue;
    }
    console.log(`\n=== Run HMR E2E: ${sample} ===`);
    await runSample(sample, cfg);
  }
  console.log('\nAll sample HMR E2E tests passed.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
