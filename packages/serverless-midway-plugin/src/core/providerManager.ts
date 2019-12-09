import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';

export function ProviderManager(this: any) {
  if (!this.serverless || !this.serverless.pluginManager) {
    return;
  }

  const providerDir = resolve(__dirname, '../provider');

  const dirList = readdirSync(providerDir);

  const currentProvider: string = this.serverless.service && this.serverless.service.provider && this.serverless.service.provider.name;

  this.serverless.cli.log(`Load plugin`);
  for (const dirName of dirList) {
    // filter plugin increase the load speed
    if (!/^default/.test(dirName)) {
      if (!currentProvider) {
        // no service.provider.name only load default plugin
        continue;
      }
      if (currentProvider !== dirName) {
         // plugin not support for current provider
         continue;
      }
    }

    const providerPath: string = resolve(providerDir, dirName);

    const stat = statSync(providerPath);

    if (stat.isDirectory()) {
      try {
        const start = Date.now();
        const Provider = require(providerPath).default;

        if (!Provider.isProvider) {
          continue;
        }

        this.serverless.pluginManager.addPlugin(Provider);
        this.serverless.cli.log(` - ${dirName} plugin (${Date.now() - start}ms)`);
      } catch (err) {
        console.log('err', err);
      }
    }
  }
}
