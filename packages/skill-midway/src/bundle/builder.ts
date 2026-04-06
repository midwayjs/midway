import * as fs from 'fs';
import * as path from 'path';
import { collectChangelogRecords } from './changelog';
import { collectDocRecords } from './docs';
import { collectApiRecords } from './typedoc';
import type {
  BuildKnowledgeBundleOptions,
  BuildKnowledgeBundleResult,
  KnowledgeManifest,
  VersionBundleManifest,
} from '../types';
import {
  DEFAULT_REPO_BLOB_BASE_URL,
  collectWorkspacePackages,
  ensureDirectory,
  extractCurrentVersionFromConfig,
  readJsonFile,
} from '../utils';

export function buildKnowledgeBundle(
  options: BuildKnowledgeBundleOptions
): BuildKnowledgeBundleResult {
  const repoBlobBaseUrl = options.repoBlobBaseUrl ?? DEFAULT_REPO_BLOB_BASE_URL;
  const currentVersion = extractCurrentVersionFromConfig(
    path.join(options.siteRoot, 'docusaurus.config.js')
  );
  const historicalVersions = readJsonFile<string[]>(
    path.join(options.siteRoot, 'versions.json')
  );
  const versions = [currentVersion, ...historicalVersions];

  fs.rmSync(options.outputDir, { recursive: true, force: true });
  ensureDirectory(options.outputDir);

  const packageRecords = collectWorkspacePackages(
    options.repoRoot,
    repoBlobBaseUrl
  );
  const versionManifests: VersionBundleManifest[] = [];
  const changelogRecords = collectChangelogRecords({
    repoRoot: options.repoRoot,
    changelogPath: path.join(options.repoRoot, 'CHANGELOG.md'),
    repoBlobBaseUrl,
  });

  for (const version of versions) {
    const apiSupported = version === currentVersion;
    const docRecords = collectVersionDocs({
      repoRoot: options.repoRoot,
      siteRoot: options.siteRoot,
      version,
      currentVersion,
      repoBlobBaseUrl,
    });
    const apiRecords = apiSupported
      ? collectVersionApis({
          repoRoot: options.repoRoot,
          siteRoot: options.siteRoot,
          version,
          currentVersion,
          repoBlobBaseUrl,
        })
      : [];

    const versionOutputDir = path.join(options.outputDir, 'versions', version);
    ensureDirectory(versionOutputDir);

    fs.writeFileSync(
      path.join(versionOutputDir, 'docs.json'),
      JSON.stringify(docRecords, null, 2) + '\n'
    );
    if (apiSupported) {
      fs.writeFileSync(
        path.join(versionOutputDir, 'api.json'),
        JSON.stringify(apiRecords, null, 2) + '\n'
      );
    }
    fs.writeFileSync(
      path.join(versionOutputDir, 'packages.json'),
      JSON.stringify(packageRecords, null, 2) + '\n'
    );
    fs.writeFileSync(
      path.join(versionOutputDir, 'changelog.json'),
      JSON.stringify(changelogRecords, null, 2) + '\n'
    );

    versionManifests.push({
      version,
      locales: Array.from(
        new Set(docRecords.map(record => record.locale))
      ).sort(),
      docsFile: `versions/${version}/docs.json`,
      apiFile: apiSupported ? `versions/${version}/api.json` : undefined,
      packagesFile: `versions/${version}/packages.json`,
      changelogFile: `versions/${version}/changelog.json`,
      docCount: docRecords.length,
      apiCount: apiRecords.length,
      packageCount: packageRecords.length,
      changelogCount: changelogRecords.length,
      capabilities: {
        docs: true,
        api: apiSupported,
        changelog: true,
      },
    });
  }

  const manifest: KnowledgeManifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    currentVersion,
    repoUrl: repoBlobBaseUrl.replace(/\/blob\/main$/, ''),
    versions: versionManifests,
  };

  fs.writeFileSync(
    path.join(options.outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );

  return {
    manifest,
    outputDir: options.outputDir,
  };
}

function collectVersionDocs(options: {
  repoRoot: string;
  siteRoot: string;
  version: string;
  currentVersion: string;
  repoBlobBaseUrl: string;
}) {
  const records = [];
  const localeRoots = resolveDocLocaleRoots(
    options.siteRoot,
    options.version,
    options.currentVersion
  );

  for (const localeRoot of localeRoots) {
    if (!fs.existsSync(localeRoot.docsRoot)) {
      continue;
    }

    records.push(
      ...collectDocRecords({
        repoRoot: options.repoRoot,
        docsRoot: localeRoot.docsRoot,
        version: options.version,
        locale: localeRoot.locale,
        repoBlobBaseUrl: options.repoBlobBaseUrl,
      })
    );
  }

  return records;
}

function collectVersionApis(options: {
  repoRoot: string;
  siteRoot: string;
  version: string;
  currentVersion: string;
  repoBlobBaseUrl: string;
}) {
  const typedocJsonPath =
    options.version === options.currentVersion
      ? path.join(options.siteRoot, '.docusaurus', 'api-typedoc-default.json')
      : path.join(
          options.siteRoot,
          'versioned_docs',
          `version-${options.version}`,
          'api-typedoc.json'
        );

  if (!fs.existsSync(typedocJsonPath)) {
    return [];
  }

  return collectApiRecords({
    repoRoot: options.repoRoot,
    typedocJsonPath,
    version: options.version,
    repoBlobBaseUrl: options.repoBlobBaseUrl,
  });
}

function resolveDocLocaleRoots(
  siteRoot: string,
  version: string,
  currentVersion: string
) {
  if (version === currentVersion) {
    return [
      {
        locale: 'zh-cn',
        docsRoot: path.join(siteRoot, 'docs'),
      },
      {
        locale: 'en',
        docsRoot: path.join(
          siteRoot,
          'i18n',
          'en',
          'docusaurus-plugin-content-docs',
          'current'
        ),
      },
    ];
  }

  return [
    {
      locale: 'zh-cn',
      docsRoot: path.join(siteRoot, 'versioned_docs', `version-${version}`),
    },
    {
      locale: 'en',
      docsRoot: path.join(
        siteRoot,
        'i18n',
        'en',
        'docusaurus-plugin-content-docs',
        `version-${version}`
      ),
    },
  ];
}
