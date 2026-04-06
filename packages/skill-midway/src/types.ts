export interface DocRecord {
  id: string;
  kind: 'doc';
  version: string;
  locale: string;
  slug: string;
  title: string;
  summary: string;
  headings: string[];
  sourcePath: string;
  sourceUrl: string;
}

export interface ApiRecord {
  id: string;
  kind: 'api';
  version: string;
  packageName: string;
  symbolName: string;
  symbolKind: string;
  qualifiedName: string;
  summary: string;
  deprecated: boolean;
  sourcePath: string;
  sourceUrl: string;
}

export interface PackageRecord {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  sourcePath: string;
  sourceUrl: string;
}

export interface ChangelogRecord {
  id: string;
  kind: 'changelog';
  releaseVersion: string;
  releaseDate: string;
  majorVersion: string;
  summary: string;
  content: string;
  packageNames: string[];
  sourcePath: string;
  sourceUrl: string;
}

export interface VersionBundleManifest {
  version: string;
  locales: string[];
  docsFile: string;
  apiFile?: string;
  packagesFile: string;
  changelogFile: string;
  docCount: number;
  apiCount: number;
  packageCount: number;
  changelogCount: number;
  capabilities: {
    docs: boolean;
    api: boolean;
    changelog: boolean;
  };
}

export interface KnowledgeManifest {
  schemaVersion: 1;
  generatedAt: string;
  currentVersion: string;
  repoUrl: string;
  versions: VersionBundleManifest[];
}

export interface BuildKnowledgeBundleOptions {
  repoRoot: string;
  siteRoot: string;
  outputDir: string;
  repoBlobBaseUrl?: string;
}

export interface BuildKnowledgeBundleResult {
  manifest: KnowledgeManifest;
  outputDir: string;
}

export interface ResolvedVersion {
  requestedVersion: string;
  resolvedVersion: string;
  matchType: 'alias' | 'exact' | 'fallback';
  capabilities: {
    docs: boolean;
    api: boolean;
    changelog: boolean;
  };
}

export interface KnowledgeVersionBundle {
  manifest: VersionBundleManifest;
  docs: DocRecord[];
  api: ApiRecord[];
  packages: PackageRecord[];
  changelog: ChangelogRecord[];
}
