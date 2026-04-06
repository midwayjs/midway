import * as fs from 'fs';
import * as path from 'path';
import { loadManifest, resolveVersion } from '../lookup';
import type { ResolvedVersion } from '../types';

const INVOCATION_CWD = process.cwd();

export function resolvePackageRoot(): string {
  return path.resolve(__dirname, '../..');
}

export function resolveInvocationCwd(): string {
  return INVOCATION_CWD;
}

export function resolveDefaultRepoRoot(): string {
  const packageRoot = resolvePackageRoot();
  return path.resolve(packageRoot, '../..');
}

export function resolvePackagedBundleRoot(): string {
  return path.join(resolvePackageRoot(), 'bundle');
}

export function resolveDefaultBundleRoot(): string {
  const packagedBundleRoot = resolvePackagedBundleRoot();
  if (fs.existsSync(path.join(packagedBundleRoot, 'manifest.json'))) {
    return packagedBundleRoot;
  }
  return path.resolve(resolveInvocationCwd(), 'site', '.midway-skill');
}

export function resolveBundleVersion(
  bundleRoot: string,
  requestedVersion = 'current'
): ResolvedVersion {
  const manifest = loadManifest(bundleRoot);
  return resolveVersion(manifest, requestedVersion);
}

export function parseLimit(value: string): number {
  return Number.parseInt(value, 10);
}
