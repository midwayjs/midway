import * as path from 'path';
import { Command, CommandRunner, Option } from '@midwayjs/commander';
import { lookupPackages } from '../../lookup';
import {
  parseLimit,
  resolveBundleVersion,
  resolveDefaultBundleRoot,
} from '../support';

@Command({
  name: 'lookup-packages',
  description: 'Query package metadata from the local skill bundle',
})
export class LookupPackagesCommand implements CommandRunner {
  @Option({
    flags: '-q, --query <text>',
    description: 'Lookup query text',
    required: true,
  })
  parseQuery(value: string) {
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
    flags: '--limit [count]',
    description: 'Maximum number of results',
  })
  parseLimitOption(value: string) {
    return parseLimit(value);
  }

  async run(
    _passedParams: string[],
    options?: {
      query: string;
      bundleRoot?: string;
      version?: string;
      limit?: number;
    }
  ) {
    const requestedVersion = options?.version ?? 'current';
    const bundleRoot = options?.bundleRoot ?? resolveDefaultBundleRoot();
    const resolved = resolveBundleVersion(bundleRoot, requestedVersion);
    const records = lookupPackages(bundleRoot, {
      query: options?.query ?? '',
      version: requestedVersion,
      limit: options?.limit,
    });

    return {
      bundleRoot,
      query: options?.query ?? '',
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
