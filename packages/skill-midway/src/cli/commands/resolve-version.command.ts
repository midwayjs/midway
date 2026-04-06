import * as path from 'path';
import { Command, CommandRunner, Option } from '@midwayjs/commander';
import { resolveBundleVersion, resolveDefaultBundleRoot } from '../support';

@Command({
  name: 'resolve-version',
  description:
    'Resolve a requested Midway version against the local skill bundle',
  arguments: '[version]',
})
export class ResolveVersionCommand implements CommandRunner {
  @Option({
    flags: '--bundle-root [path]',
    description: 'Bundle root directory',
  })
  parseBundleRoot(value: string) {
    return path.resolve(value);
  }

  async run(
    passedParams: string[],
    options?: {
      bundleRoot?: string;
    }
  ) {
    const requestedVersion = passedParams[0] ?? 'current';
    const bundleRoot = options?.bundleRoot ?? resolveDefaultBundleRoot();

    return {
      bundleRoot,
      ...resolveBundleVersion(bundleRoot, requestedVersion),
    };
  }
}
