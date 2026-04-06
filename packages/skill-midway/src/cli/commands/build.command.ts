import * as fs from 'fs';
import * as path from 'path';
import { Command, CommandRunner, Option } from '@midwayjs/commander';
import { buildKnowledgeBundle } from '../../bundle/builder';
import { resolveDefaultRepoRoot, resolvePackagedBundleRoot } from '../support';

@Command({
  name: 'build',
  description: 'Build the Midway skill knowledge bundle',
})
export class BuildCommand implements CommandRunner {
  @Option({
    flags: '--repo-root [path]',
    description: 'Repository root that contains the site directory',
  })
  parseRepoRoot(value: string) {
    return path.resolve(value);
  }

  @Option({
    flags: '--site-root [path]',
    description: 'Docusaurus site root',
  })
  parseSiteRoot(value: string) {
    return path.resolve(value);
  }

  @Option({
    flags: '--output [path]',
    description: 'Output directory for the generated bundle',
  })
  parseOutput(value: string) {
    return path.resolve(value);
  }

  @Option({
    flags: '--package-bundle [path]',
    description: 'Package-local bundle directory to sync for npm publishing',
  })
  parsePackageBundle(value: string) {
    return path.resolve(value);
  }

  async run(
    _passedParams: string[],
    options?: {
      repoRoot?: string;
      siteRoot?: string;
      output?: string;
      packageBundle?: string;
    }
  ) {
    const repoRoot = options?.repoRoot ?? resolveDefaultRepoRoot();
    const siteRoot = options?.siteRoot ?? path.join(repoRoot, 'site');
    const outputDir = options?.output ?? path.join(siteRoot, '.midway-skill');
    const packageBundleDir =
      options?.packageBundle ?? resolvePackagedBundleRoot();

    const result = buildKnowledgeBundle({
      repoRoot,
      siteRoot,
      outputDir,
    });
    syncBundle(result.outputDir, packageBundleDir);

    return [
      'Generated Midway skill bundle',
      `  output: ${result.outputDir}`,
      `  packageBundle: ${packageBundleDir}`,
      `  currentVersion: ${result.manifest.currentVersion}`,
      `  versions: ${result.manifest.versions.length}`,
      '',
    ].join('\n');
  }
}

function syncBundle(sourceDir: string, destinationDir: string): void {
  fs.rmSync(destinationDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destinationDir), { recursive: true });
  fs.cpSync(sourceDir, destinationDir, { recursive: true });
}
