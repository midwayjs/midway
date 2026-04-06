import * as path from 'path';
import { Command, CommandRunner, Option } from '@midwayjs/commander';
import { lookupApi } from '../../lookup';
import {
  parseLimit,
  resolveBundleVersion,
  resolveDefaultBundleRoot,
} from '../support';

@Command({
  name: 'lookup-api',
  description: 'Query API records from the local skill bundle',
})
export class LookupApiCommand implements CommandRunner {
  @Option({
    flags: '-s, --symbol <name>',
    description: 'API symbol name or qualified name',
    required: true,
  })
  parseSymbol(value: string) {
    return value.trim();
  }

  @Option({
    flags: '--bundle-root [path]',
    description: 'Bundle root directory',
  })
  parseBundleRoot(value: string) {
    return path.resolve(value);
  }

  @Option({
    flags: '--version [version]',
    description: 'Requested Midway version',
  })
  parseVersion(value: string) {
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
      symbol: string;
      bundleRoot?: string;
      version?: string;
      package?: string;
      limit?: number;
    }
  ) {
    const requestedVersion = options?.version ?? 'current';
    const bundleRoot = options?.bundleRoot ?? resolveDefaultBundleRoot();
    const resolved = resolveBundleVersion(bundleRoot, requestedVersion);
    const records = lookupApi(bundleRoot, {
      symbol: options?.symbol ?? '',
      version: requestedVersion,
      packageName: options?.package,
      limit: options?.limit,
    });

    return {
      bundleRoot,
      symbol: options?.symbol ?? '',
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
