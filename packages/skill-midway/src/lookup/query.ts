import * as fs from 'fs';
import * as path from 'path';
import type {
  ApiRecord,
  ChangelogRecord,
  DocRecord,
  KnowledgeManifest,
  KnowledgeVersionBundle,
  PackageRecord,
  ResolvedVersion,
} from '../types';
import { readJsonFile } from '../utils';

export function loadManifest(bundleRoot: string): KnowledgeManifest {
  return readJsonFile<KnowledgeManifest>(path.join(bundleRoot, 'manifest.json'));
}

export function resolveVersion(
  manifest: KnowledgeManifest,
  requestedVersion: string
): ResolvedVersion {
  const normalizedRequested = requestedVersion.trim();
  if (normalizedRequested === 'current' || normalizedRequested === 'latest') {
    const currentVersionManifest = manifest.versions.find(
      version => version.version === manifest.currentVersion
    );
    return {
      requestedVersion,
      resolvedVersion: manifest.currentVersion,
      matchType: 'alias',
      capabilities: currentVersionManifest?.capabilities ?? {
        docs: true,
        api: true,
        changelog: true,
      },
    };
  }

  const exact = manifest.versions.find(
    version => version.version === normalizedRequested
  );
  if (exact) {
    return {
      requestedVersion,
      resolvedVersion: exact.version,
      matchType: 'exact',
      capabilities: exact.capabilities,
    };
  }

  const requestedMajor = normalizedRequested.replace(/^v/, '').split('.')[0];
  const sameMajor = manifest.versions.filter(version =>
    version.version.replace(/^v/, '').startsWith(`${requestedMajor}.`)
  );
  if (sameMajor.length > 0) {
    const fallback = sameMajor
      .slice()
      .sort((left, right) => compareSemverish(right.version, left.version))[0];
    return {
      requestedVersion,
      resolvedVersion: fallback.version,
      matchType: 'fallback',
      capabilities: fallback.capabilities,
    };
  }

  const currentVersionManifest = manifest.versions.find(
    version => version.version === manifest.currentVersion
  );
  return {
    requestedVersion,
    resolvedVersion: manifest.currentVersion,
    matchType: 'fallback',
    capabilities: currentVersionManifest?.capabilities ?? {
      docs: true,
      api: true,
      changelog: true,
    },
  };
}

export function loadVersionBundle(
  bundleRoot: string,
  version: string
): KnowledgeVersionBundle {
  const manifest = loadManifest(bundleRoot);
  const resolved = resolveVersion(manifest, version);
  const versionManifest = manifest.versions.find(
    item => item.version === resolved.resolvedVersion
  );
  if (!versionManifest) {
    throw new Error(`Bundle version ${resolved.resolvedVersion} not found`);
  }

  return {
    manifest: versionManifest,
    docs: readVersionFile<DocRecord[]>(bundleRoot, versionManifest.docsFile),
    api: versionManifest.apiFile
      ? readVersionFile<ApiRecord[]>(bundleRoot, versionManifest.apiFile)
      : [],
    packages: readVersionFile<PackageRecord[]>(
      bundleRoot,
      versionManifest.packagesFile
    ),
    changelog: readVersionFile<ChangelogRecord[]>(
      bundleRoot,
      versionManifest.changelogFile
    ),
  };
}

export function lookupDocs(
  bundleRoot: string,
  options: {
    query: string;
    version?: string;
    locale?: string;
    limit?: number;
  }
): DocRecord[] {
  const bundle = loadVersionBundle(bundleRoot, options.version ?? 'current');
  const locale = options.locale;
  return scoreMatches(
    bundle.docs.filter(record => !locale || record.locale === locale),
    record => [
      record.title,
      record.slug,
      record.summary,
      ...record.headings,
    ],
    options.query,
    options.limit ?? 10
  );
}

export function lookupApi(
  bundleRoot: string,
  options: {
    symbol: string;
    packageName?: string;
    version?: string;
    limit?: number;
  }
): ApiRecord[] {
  const bundle = loadVersionBundle(bundleRoot, options.version ?? 'current');
  if (!bundle.manifest.capabilities.api) {
    return [];
  }
  return scoreMatches(
    bundle.api.filter(
      record => !options.packageName || record.packageName === options.packageName
    ),
    record => [
      record.symbolName,
      record.qualifiedName,
      record.packageName,
      record.summary,
    ],
    options.symbol,
    options.limit ?? 10
  );
}

export function lookupPackages(
  bundleRoot: string,
  options: {
    query: string;
    version?: string;
    limit?: number;
  }
): PackageRecord[] {
  const bundle = loadVersionBundle(bundleRoot, options.version ?? 'current');
  return scoreMatches(
    bundle.packages,
    record => [record.name, record.description, ...record.keywords],
    options.query,
    options.limit ?? 10
  );
}

export function lookupChangelog(
  bundleRoot: string,
  options: {
    fromVersion?: string;
    toVersion?: string;
    packageName?: string;
    limit?: number;
  }
): ChangelogRecord[] {
  const bundle = loadVersionBundle(bundleRoot, options.toVersion ?? 'current');
  const fromVersion = options.fromVersion;
  const toVersion = options.toVersion;

  const filtered = bundle.changelog.filter(record => {
    if (
      options.packageName &&
      !record.packageNames.includes(options.packageName) &&
      !record.packageNames.includes(options.packageName.replace(/^@midwayjs\//, ''))
    ) {
      return false;
    }

    if (fromVersion && compareSemverish(record.releaseVersion, fromVersion) < 0) {
      return false;
    }

    if (toVersion && compareSemverish(record.releaseVersion, toVersion) > 0) {
      return false;
    }

    return true;
  });

  return filtered
    .sort((left, right) =>
      compareSemverish(right.releaseVersion, left.releaseVersion)
    )
    .slice(0, options.limit ?? 10);
}

function readVersionFile<T>(bundleRoot: string, relativePath: string): T {
  const absolutePath = path.join(bundleRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Bundle file not found: ${absolutePath}`);
  }
  return readJsonFile<T>(absolutePath);
}

function scoreMatches<T>(
  records: T[],
  fields: (record: T) => string[],
  query: string,
  limit: number
): T[] {
  const needle = query.trim().toLowerCase();
  const scored = records
    .map(record => ({
      record,
      score: computeScore(fields(record), needle),
    }))
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return scored.slice(0, limit).map(item => item.record);
}

function computeScore(fields: string[], query: string): number {
  if (!query) {
    return 1;
  }

  let score = 0;
  for (const field of fields) {
    const normalized = field.toLowerCase();
    if (normalized === query) {
      score += 100;
    } else if (normalized.startsWith(query)) {
      score += 50;
    } else if (normalized.includes(query)) {
      score += 10;
    }
  }
  return score;
}

function compareSemverish(left: string, right: string): number {
  const leftParts = parseSemverish(left);
  const rightParts = parseSemverish(right);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index++) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;
    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

function parseSemverish(value: string): number[] {
  const normalized = value.replace(/^v/, '');
  const [core, prerelease = ''] = normalized.split('-');
  const coreParts = core.split('.').map(part => parseInt(part, 10) || 0);
  if (!prerelease) {
    coreParts.push(Number.MAX_SAFE_INTEGER);
    return coreParts;
  }

  const prereleaseParts = prerelease
    .split('.')
    .map(part => parseInt(part.replace(/^\D+/, ''), 10) || 0);

  return [...coreParts, -1, ...prereleaseParts];
}
