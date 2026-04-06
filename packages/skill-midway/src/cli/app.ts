import { Bootstrap } from '@midwayjs/bootstrap';
import { BuildCommand } from './commands/build.command';
import { InstallCommand } from './commands/install.command';
import { LookupApiCommand } from './commands/lookup-api.command';
import { LookupChangelogCommand } from './commands/lookup-changelog.command';
import { LookupDocsCommand } from './commands/lookup-docs.command';
import { LookupPackagesCommand } from './commands/lookup-packages.command';
import { ResolveVersionCommand } from './commands/resolve-version.command';
import { UpdateCommand } from './commands/update.command';
import { MainConfiguration } from './configuration';
import { InstallTargetQuestionSet } from './questions/install-target.question';
import { resolvePackageRoot } from './support';

export async function runCli(): Promise<void> {
  const packageRoot = resolvePackageRoot();

  Bootstrap.configure({
    appDir: packageRoot,
    baseDir: __dirname,
    logger: false,
    imports: [
      {
        Configuration: MainConfiguration,
      },
    ],
    preloadModules: [
      BuildCommand,
      ResolveVersionCommand,
      LookupDocsCommand,
      LookupApiCommand,
      LookupPackagesCommand,
      LookupChangelogCommand,
      InstallCommand,
      UpdateCommand,
      InstallTargetQuestionSet,
    ],
  });

  try {
    await Bootstrap.run();
  } finally {
    await Bootstrap.stop();
  }
}
