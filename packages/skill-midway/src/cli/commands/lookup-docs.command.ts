import * as path from 'path';
import { Command, CommandRunner, Option } from '@midwayjs/commander';
import { lookupDocs } from '../../lookup';
import {
  parseLimit,
  resolveBundleVersion,
  resolveDefaultBundleRoot,
} from '../support';

@Command({
  name: 'lookup-docs',
  description: 'Query docs records from the local skill bundle',
})
export class LookupDocsCommand implements CommandRunner {
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
    flags: '--locale [locale]',
    description: 'Docs locale, for example zh-cn or en',
  })
  parseLocale(value: string) {
    return value.trim().toLowerCase();
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
      locale?: string;
      limit?: number;
    }
  ) {
    const requestedVersion = options?.version ?? 'current';
    const bundleRoot = options?.bundleRoot ?? resolveDefaultBundleRoot();
    const resolved = resolveBundleVersion(bundleRoot, requestedVersion);
    const records = lookupDocs(bundleRoot, {
      query: options?.query ?? '',
      version: requestedVersion,
      locale: options?.locale,
      limit: options?.limit,
    });

    return {
      bundleRoot,
      query: options?.query ?? '',
      locale: options?.locale ?? null,
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
