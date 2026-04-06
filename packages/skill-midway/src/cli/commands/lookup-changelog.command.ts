import * as path from 'path';
import { Command, CommandRunner, Option } from '@midwayjs/commander';
import { lookupChangelog } from '../../lookup';
import {
  parseLimit,
  resolveBundleVersion,
  resolveDefaultBundleRoot,
} from '../support';

@Command({
  name: 'lookup-changelog',
  description: 'Query changelog records from the local skill bundle',
})
export class LookupChangelogCommand implements CommandRunner {
  @Option({
    flags: '--bundle-root [path]',
    description: 'Bundle root directory',
  })
  parseBundleRoot(value: string) {
    return path.resolve(value);
  }

  @Option({
    flags: '--from-version [version]',
    description: 'Minimum release version',
  })
  parseFromVersion(value: string) {
    return value.trim();
  }

  @Option({
    flags: '--to-version [version]',
    description: 'Maximum release version or requested bundle version',
  })
  parseToVersion(value: string) {
    return value.trim();
  }

  @Option({
    flags: '--package [name]',
    description: 'Filter by package name',
  })
  parsePackageName(value: string) {
    return value.trim();
  }

  @Option({
    flags: '--limit [count]',
    description: 'Maximum number of results',
  })
  parseLimitOption(value: string) {
    return parseLimit(value);
  }

  async run(
    _passedParams: string[],
    options?: {
      bundleRoot?: string;
      fromVersion?: string;
      toVersion?: string;
      package?: string;
      limit?: number;
    }
  ) {
    const requestedVersion = options?.toVersion ?? 'current';
    const bundleRoot = options?.bundleRoot ?? resolveDefaultBundleRoot();
    const resolved = resolveBundleVersion(bundleRoot, requestedVersion);
    const records = lookupChangelog(bundleRoot, {
      fromVersion: options?.fromVersion,
      toVersion: options?.toVersion,
      packageName: options?.package,
      limit: options?.limit,
    });

    return {
      bundleRoot,
      fromVersion: options?.fromVersion ?? null,
      toVersion: options?.toVersion ?? null,
      packageName: options?.package ?? null,
      limit: options?.limit ?? 10,
      requestedVersion,
      resolvedVersion: resolved.resolvedVersion,
      matchType: resolved.matchType,
      capabilities: resolved.capabilities,
      count: records.length,
      records,
    };
  }
}
