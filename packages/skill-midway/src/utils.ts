import * as fs from 'fs';
import * as path from 'path';
import type { PackageRecord } from './types';

export const DEFAULT_REPO_BLOB_BASE_URL =
  'https://github.com/midwayjs/midway/blob/main';

export function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

export function ensureDirectory(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function listFilesRecursively(rootDir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(rootDir)) {
    return results;
  }

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursively(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

export function stripFileExtension(filePath: string): string {
  return filePath.replace(/\.(md|mdx)$/i, '');
}

export function filePathToSourceUrl(
  repoRoot: string,
  filePath: string,
  repoBlobBaseUrl: string
): string {
  const relativePath = toPosixPath(path.relative(repoRoot, filePath));
  return `${repoBlobBaseUrl}/${relativePath}`;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractCurrentVersionFromConfig(configPath: string): string {
  const content = fs.readFileSync(configPath, 'utf8');
  const match = content.match(/current:\s*\{\s*label:\s*['"]([^'"]+)['"]/m);
  if (!match) {
    throw new Error(
      `Unable to resolve current docs version from ${configPath}`
    );
  }
  return match[1];
}

export function collectWorkspacePackages(
  repoRoot: string,
  repoBlobBaseUrl: string
): PackageRecord[] {
  const workspaceDirs = [
    'packages',
    'packages-serverless',
    'packages-resource',
  ];
  const packages: PackageRecord[] = [];

  for (const workspaceDir of workspaceDirs) {
    const absoluteWorkspaceDir = path.join(repoRoot, workspaceDir);
    if (!fs.existsSync(absoluteWorkspaceDir)) {
      continue;
    }

    for (const entry of fs.readdirSync(absoluteWorkspaceDir, {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(
        absoluteWorkspaceDir,
        entry.name,
        'package.json'
      );
      if (!fs.existsSync(packageJsonPath)) {
        continue;
      }

      const packageJson = readJsonFile<{
        name: string;
        version?: string;
        description?: string;
        keywords?: string[];
      }>(packageJsonPath);

      packages.push({
        name: packageJson.name,
        version: packageJson.version ?? '0.0.0',
        description: packageJson.description ?? '',
        keywords: packageJson.keywords ?? [],
        sourcePath: toPosixPath(path.relative(repoRoot, packageJsonPath)),
        sourceUrl: filePathToSourceUrl(
          repoRoot,
          packageJsonPath,
          repoBlobBaseUrl
        ),
      });
    }
  }

  return packages.sort((left, right) => left.name.localeCompare(right.name));
}

export function createWorkspacePackageMap(
  repoRoot: string
): Map<string, string> {
  const workspaceDirs = [
    'packages',
    'packages-serverless',
    'packages-resource',
  ];
  const packageMap = new Map<string, string>();

  for (const workspaceDir of workspaceDirs) {
    const absoluteWorkspaceDir = path.join(repoRoot, workspaceDir);
    if (!fs.existsSync(absoluteWorkspaceDir)) {
      continue;
    }

    for (const entry of fs.readdirSync(absoluteWorkspaceDir, {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(
        absoluteWorkspaceDir,
        entry.name,
        'package.json'
      );
      if (!fs.existsSync(packageJsonPath)) {
        continue;
      }

      const packageJson = readJsonFile<{ name: string }>(packageJsonPath);
      packageMap.set(entry.name, packageJson.name);
    }
  }

  return packageMap;
}
