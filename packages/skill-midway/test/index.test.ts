import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { close, createLightApp } from '@midwayjs/mock';
import { Framework } from '@midwayjs/commander';
jest.mock(
  'enquirer',
  () => ({
    prompt: jest.fn(async questionInput => {
      const question = Array.isArray(questionInput)
        ? questionInput[0]
        : questionInput;

      if (question.type === 'select') {
        const choices =
          typeof question.choices === 'function'
            ? await question.choices({})
            : question.choices ?? [];
        const rawValue = Array.isArray(choices) ? String(choices[0]) : 'codex';
        const value =
          typeof question.result === 'function'
            ? await question.result(rawValue, {})
            : rawValue;
        return { [question.name]: value };
      }

      if (question.type === 'multiselect') {
        const choices =
          typeof question.choices === 'function'
            ? await question.choices({})
            : question.choices ?? [];
        const rawValue = Array.isArray(choices)
          ? choices.slice(0, 2).map(item => String(item))
          : ['codex'];
        const value =
          typeof question.result === 'function'
            ? await question.result(rawValue, {})
            : rawValue;
        return { [question.name]: value };
      }

      return { [question.name]: 'default' };
    }),
  }),
  { virtual: true }
);
import {
  buildKnowledgeBundle,
  loadManifest,
  lookupApi,
  lookupChangelog,
  lookupDocs,
  lookupPackages,
  resolveVersion,
} from '../src';
import { BuildCommand } from '../src/cli/commands/build.command';
import { InstallCommand } from '../src/cli/commands/install.command';
import { LookupApiCommand } from '../src/cli/commands/lookup-api.command';
import { LookupDocsCommand } from '../src/cli/commands/lookup-docs.command';
import { ResolveVersionCommand } from '../src/cli/commands/resolve-version.command';
import { UpdateCommand } from '../src/cli/commands/update.command';

describe('agent knowledge bundle builder', () => {
  it('should generate docs, api and package bundles for current and historical versions', () => {
    const sandboxRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-')
    );
    const repoRoot = path.join(sandboxRoot, 'repo');
    const siteRoot = path.join(repoRoot, 'site');
    const outputDir = path.join(siteRoot, '.midway-skill');

    createFixtureTree(repoRoot);

    buildKnowledgeBundle({
      repoRoot,
      siteRoot,
      outputDir,
      repoBlobBaseUrl: 'https://github.com/midwayjs/midway/blob/main',
    });

    const manifestPath = path.join(outputDir, 'manifest.json');
    const currentDocsPath = path.join(outputDir, 'versions', '4.0.0', 'docs.json');
    const historyDocsPath = path.join(outputDir, 'versions', '3.0.0', 'docs.json');
    const currentApiPath = path.join(outputDir, 'versions', '4.0.0', 'api.json');
    const historyApiPath = path.join(outputDir, 'versions', '3.0.0', 'api.json');
    const packagesPath = path.join(outputDir, 'versions', '4.0.0', 'packages.json');
    const changelogPath = path.join(outputDir, 'versions', '4.0.0', 'changelog.json');

    expect(fs.existsSync(manifestPath)).toBe(true);
    expect(fs.existsSync(currentDocsPath)).toBe(true);
    expect(fs.existsSync(historyDocsPath)).toBe(true);
    expect(fs.existsSync(currentApiPath)).toBe(true);
    expect(fs.existsSync(historyApiPath)).toBe(false);
    expect(fs.existsSync(packagesPath)).toBe(true);
    expect(fs.existsSync(changelogPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const currentDocs = JSON.parse(fs.readFileSync(currentDocsPath, 'utf8'));
    const historyDocs = JSON.parse(fs.readFileSync(historyDocsPath, 'utf8'));
    const currentApis = JSON.parse(fs.readFileSync(currentApiPath, 'utf8'));
    const packages = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));
    const changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf8'));

    expect(manifest.currentVersion).toBe('4.0.0');
    expect(manifest.versions.map(version => version.version)).toEqual([
      '4.0.0',
      '3.0.0',
    ]);
    expect(manifest.versions[0].capabilities).toEqual({
      docs: true,
      api: true,
      changelog: true,
    });
    expect(manifest.versions[1].capabilities).toEqual({
      docs: true,
      api: false,
      changelog: true,
    });

    expect(currentDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          version: '4.0.0',
          locale: 'zh-cn',
          slug: 'intro',
          title: '当前中文标题',
        }),
        expect.objectContaining({
          version: '4.0.0',
          locale: 'en',
          slug: 'intro',
          title: 'Current English Title',
        }),
      ])
    );

    expect(historyDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          version: '3.0.0',
          locale: 'zh-cn',
          slug: 'intro',
        }),
        expect.objectContaining({
          version: '3.0.0',
          locale: 'en',
          slug: 'intro',
        }),
      ])
    );

    expect(currentApis).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          version: '4.0.0',
          packageName: '@midwayjs/core',
          symbolName: 'Configuration',
          symbolKind: 'Class',
          qualifiedName: 'Configuration',
        }),
      ])
    );

    expect(packages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '@midwayjs/core',
          version: '4.0.1',
        }),
      ])
    );

    expect(changelog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          releaseVersion: '4.0.1',
          packageNames: expect.arrayContaining(['core']),
        }),
      ])
    );
  });

  it('should resolve versions and query generated bundle records', () => {
    const sandboxRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-query-')
    );
    const repoRoot = path.join(sandboxRoot, 'repo');
    const siteRoot = path.join(repoRoot, 'site');
    const outputDir = path.join(siteRoot, '.midway-skill');

    createFixtureTree(repoRoot);
    buildKnowledgeBundle({
      repoRoot,
      siteRoot,
      outputDir,
      repoBlobBaseUrl: 'https://github.com/midwayjs/midway/blob/main',
    });

    const manifest = loadManifest(outputDir);
    expect(resolveVersion(manifest, 'latest')).toEqual({
      requestedVersion: 'latest',
      resolvedVersion: '4.0.0',
      matchType: 'alias',
      capabilities: {
        docs: true,
        api: true,
        changelog: true,
      },
    });
    expect(resolveVersion(manifest, '3.20.12')).toEqual({
      requestedVersion: '3.20.12',
      resolvedVersion: '3.0.0',
      matchType: 'fallback',
      capabilities: {
        docs: true,
        api: false,
        changelog: true,
      },
    });

    expect(
      lookupDocs(outputDir, {
        version: 'current',
        locale: 'en',
        query: 'english title',
      })[0]
    ).toEqual(
      expect.objectContaining({
        title: 'Current English Title',
      })
    );

    expect(
      lookupApi(outputDir, {
        version: '4.0.0',
        symbol: 'Configuration',
      })[0]
    ).toEqual(
      expect.objectContaining({
        symbolName: 'Configuration',
      })
    );
    expect(
      lookupApi(outputDir, {
        version: '3.20.12',
        symbol: 'LegacyConfiguration',
      })
    ).toEqual([]);

    expect(
      lookupPackages(outputDir, {
        query: '@midwayjs/core',
      })[0]
    ).toEqual(
      expect.objectContaining({
        name: '@midwayjs/core',
      })
    );

    expect(
      lookupChangelog(outputDir, {
        packageName: 'core',
        limit: 1,
      })[0]
    ).toEqual(
      expect.objectContaining({
        releaseVersion: '4.0.1',
      })
    );
  });
});

describe('midway skill cli commands', () => {
  const originalArgv = process.argv;
  const originalWrite = process.stdout.write;
  const originalStdoutIsTTY = process.stdout.isTTY;
  const originalStdinIsTTY = process.stdin.isTTY;
  let stdout = '';

  beforeEach(() => {
    process.argv = ['node', 'midway-skill'];
    stdout = '';
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: true,
    });
    process.stdout.write = ((chunk: any) => {
      stdout += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      return true;
    }) as any;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.stdout.write = originalWrite;
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: originalStdoutIsTTY,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: originalStdinIsTTY,
    });
  });

  it('should run build command through midway commander framework', async () => {
    const sandboxRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-cli-')
    );
    const repoRoot = path.join(sandboxRoot, 'repo');
    const packageBundleRoot = path.join(sandboxRoot, 'package-bundle');

    createFixtureTree(repoRoot);

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [BuildCommand],
    });
    const framework = app.getFramework() as Framework;

    await framework.runCommand(
      'build',
      '--repo-root',
      repoRoot,
      '--package-bundle',
      packageBundleRoot
    );

    expect(stdout).toContain('Generated Midway skill bundle');
    expect(stdout).toContain(path.join(repoRoot, 'site', '.midway-skill'));
    expect(stdout).toContain(packageBundleRoot);
    expect(
      fs.existsSync(path.join(repoRoot, 'site', '.midway-skill', 'manifest.json'))
    ).toBe(true);
    expect(fs.existsSync(path.join(packageBundleRoot, 'manifest.json'))).toBe(
      true
    );

    await close(app);
  });

  it('should resolve bundle version through cli command', async () => {
    const sandboxRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-resolve-')
    );
    const repoRoot = path.join(sandboxRoot, 'repo');
    const bundleRoot = path.join(repoRoot, 'site', '.midway-skill');

    createFixtureTree(repoRoot);
    buildKnowledgeBundle({
      repoRoot,
      siteRoot: path.join(repoRoot, 'site'),
      outputDir: bundleRoot,
      repoBlobBaseUrl: 'https://github.com/midwayjs/midway/blob/main',
    });

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [ResolveVersionCommand],
    });
    const framework = app.getFramework() as Framework;

    await framework.runCommand(
      'resolve-version',
      '3.20.12',
      '--bundle-root',
      bundleRoot
    );

    const payload = JSON.parse(stdout);
    expect(payload).toEqual(
      expect.objectContaining({
        requestedVersion: '3.20.12',
        resolvedVersion: '3.0.0',
        matchType: 'fallback',
        capabilities: {
          docs: true,
          api: false,
          changelog: true,
        },
      })
    );

    await close(app);
  });

  it('should return structured lookup results for docs and api commands', async () => {
    const sandboxRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-lookup-cli-')
    );
    const repoRoot = path.join(sandboxRoot, 'repo');
    const bundleRoot = path.join(repoRoot, 'site', '.midway-skill');

    createFixtureTree(repoRoot);
    buildKnowledgeBundle({
      repoRoot,
      siteRoot: path.join(repoRoot, 'site'),
      outputDir: bundleRoot,
      repoBlobBaseUrl: 'https://github.com/midwayjs/midway/blob/main',
    });

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [LookupDocsCommand, LookupApiCommand],
    });
    const framework = app.getFramework() as Framework;

    await framework.runCommand(
      'lookup-docs',
      '--query',
      'english title',
      '--locale',
      'en',
      '--bundle-root',
      bundleRoot
    );

    const docsPayload = JSON.parse(stdout);
    expect(docsPayload).toEqual(
      expect.objectContaining({
        query: 'english title',
        resolvedVersion: '4.0.0',
        count: 1,
      })
    );
    expect(docsPayload.records[0]).toEqual(
      expect.objectContaining({
        title: 'Current English Title',
      })
    );

    stdout = '';
    await framework.runCommand(
      'lookup-api',
      '--symbol',
      'LegacyConfiguration',
      '--version',
      '3.20.12',
      '--bundle-root',
      bundleRoot
    );

    const apiPayload = JSON.parse(stdout);
    expect(apiPayload).toEqual(
      expect.objectContaining({
        symbol: 'LegacyConfiguration',
        resolvedVersion: '3.0.0',
        capabilities: {
          docs: true,
          api: false,
          changelog: true,
        },
        count: 0,
      })
    );
    expect(apiPayload.records).toEqual([]);

    await close(app);
  });

  it('should install bundled skill into a codex home directory', async () => {
    const projectRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-install-')
    );

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [InstallCommand],
    });
    const framework = app.getFramework() as Framework;

    await framework.runCommand('install', '--target', 'codex', '--dest', projectRoot);

    const installedSkillPath = path.join(
      projectRoot,
      '.codex',
      'skills',
      'midway',
      'SKILL.md'
    );
    expect(stdout).toContain('Installed Midway skill');
    expect(stdout).toContain('Skill: midway');
    expect(stdout).toContain(`Project: ${projectRoot}`);
    expect(stdout).toContain('- codex');
    expect(stdout).toContain(installedSkillPath);
    expect(fs.existsSync(installedSkillPath)).toBe(true);
    expect(fs.readFileSync(installedSkillPath, 'utf8')).toContain('name: midway');

    await close(app);
  });

  it('should update an existing installed skill directory', async () => {
    const projectRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-update-')
    );
    const skillDir = path.join(projectRoot, '.codex', 'skills', 'midway');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), 'stale');

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [UpdateCommand],
    });
    const framework = app.getFramework() as Framework;

    await framework.runCommand('update', '--target', 'codex', '--dest', projectRoot);

    expect(stdout).toContain('Updated Midway skill');
    expect(stdout).toContain(`Project: ${projectRoot}`);
    expect(stdout).toContain('- codex');
    expect(stdout).toContain('(overwritten)');
    expect(fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8')).toContain(
      'Use when the task involves Midway framework docs'
    );

    await close(app);
  });

  it('should install multiple target adapters including cursor and trae', async () => {
    const projectRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-targets-')
    );

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [InstallCommand],
    });
    const framework = app.getFramework() as Framework;

    await framework.runCommand(
      'install',
      '--target',
      'cursor,trae',
      '--dest',
      projectRoot
    );

    expect(stdout).toContain(`Project: ${projectRoot}`);
    expect(stdout).toContain('- cursor');
    expect(stdout).toContain('- trae');
    expect(stdout).toContain(
      path.join(projectRoot, '.cursor', 'commands', 'opsx-midway.md')
    );
    expect(stdout).toContain(
      path.join(projectRoot, '.trae', 'skills', 'midway', 'SKILL.md')
    );
    expect(
      fs.readFileSync(
        path.join(projectRoot, '.cursor', 'commands', 'opsx-midway.md'),
        'utf8'
      )
    ).toContain('name: /opsx-midway');
    expect(
      fs.readFileSync(
        path.join(projectRoot, '.trae', 'skills', 'midway', 'SKILL.md'),
        'utf8'
      )
    ).toContain('# Midway');

    await close(app);
  });

  it('should prompt for multiple targets when install target is omitted', async () => {
    const projectRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-prompt-')
    );

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [InstallCommand],
    });
    const framework = app.getFramework() as Framework;

    await framework.runCommand('install', '--dest', projectRoot);

    expect(stdout).toContain('Installed Midway skill');
    expect(stdout).toContain('- codex');
    expect(stdout).toContain('- cursor');
    expect(
      fs.existsSync(path.join(projectRoot, '.codex', 'skills', 'midway', 'SKILL.md'))
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(projectRoot, '.cursor', 'commands', 'opsx-midway.md')
      )
    ).toBe(true);

    await close(app);
  });

  it('should require an explicit target when no interactive tty is available', async () => {
    const projectRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'midway-skill-no-tty-')
    );

    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: false,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: false,
    });

    const app = await createLightApp({
      imports: [require('../src/cli/configuration')],
      preloadModules: [InstallCommand],
    });
    const framework = app.getFramework() as Framework;

    await expect(framework.runCommand('install', '--dest', projectRoot)).rejects.toThrow(
      'No interactive TTY detected. Re-run with --target <name>, for example: midway-skill install --target codex'
    );

    expect(
      fs.existsSync(path.join(projectRoot, '.codex', 'skills', 'midway', 'SKILL.md'))
    ).toBe(false);

    await close(app);
  });
});

function createFixtureTree(repoRoot: string): void {
  const files = new Map<string, string>([
    [
      'site/docusaurus.config.js',
      `
      module.exports = {
        presets: [
          [
            'classic',
            {
              docs: {
                versions: {
                  current: {
                    label: '4.0.0',
                  },
                },
              },
            },
          ],
        ],
      };
      `,
    ],
    ['site/versions.json', JSON.stringify(['3.0.0'])],
    [
      'site/docs/intro.md',
      `---
title: 当前中文标题
---

# 当前中文标题

当前中文摘要。
`,
    ],
    [
      'site/i18n/en/docusaurus-plugin-content-docs/current/intro.md',
      `---
title: Current English Title
---

# Current English Title

Current English summary.
`,
    ],
    [
      'site/versioned_docs/version-3.0.0/intro.md',
      `# 历史中文标题

历史中文摘要。
`,
    ],
    [
      'site/i18n/en/docusaurus-plugin-content-docs/version-3.0.0/intro.md',
      `# Historical English Title

Historical English summary.
`,
    ],
    [
      'site/.docusaurus/api-typedoc-default.json',
      JSON.stringify(createTypedocFixture('core/src', 'Configuration')),
    ],
    [
      'site/versioned_docs/version-3.0.0/api-typedoc.json',
      JSON.stringify(createTypedocFixture('core/src', 'LegacyConfiguration')),
    ],
    [
      'packages/core/package.json',
      JSON.stringify({
        name: '@midwayjs/core',
        version: '4.0.1',
        description: 'Midway Core',
        keywords: ['midway', 'core'],
      }),
    ],
    [
      'CHANGELOG.md',
      `# Change Log

## v4.0.1 (2026-04-05)

#### :bug: Bug Fix
* \`core\`
  * fix(core): improve metadata

## v4.0.0 (2026-03-26)

#### :rocket: New Feature
* \`core\`
  * feat(core): initial 4.0.0 release

## v3.20.12 (2025-08-10)

#### :bug: Bug Fix
* \`core\`
  * fix(core): stabilize v3 line
`,
    ],
  ]);

  for (const [relativePath, content] of files) {
    const absolutePath = path.join(repoRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.trimStart(), 'utf8');
  }
}

function createTypedocFixture(moduleName: string, symbolName: string) {
  return {
    kind: 1,
    children: [
      {
        kind: 2,
        name: moduleName,
        children: [
          {
            kind: 128,
            kindString: 'Class',
            name: symbolName,
            comment: {
              summary: [
                {
                  text: `${symbolName} summary`,
                },
              ],
            },
            sources: [
              {
                fileName: 'packages/core/src/index.ts',
                line: 10,
              },
            ],
          },
        ],
      },
    ],
  };
}
