import {BasePlugin} from '@midwayjs/fcli-command-core';
import { resolve } from 'path';
import { copy } from 'fs-extra';
export class FaaSTmpOutPlugin extends BasePlugin {
  hooks = {
    'after:package:cleanup': async () => {
      const tmpDir = this.getStore('defaultTmpFaaSOut', 'PackagePlugin');
      console.log('tmpDIr', tmpDir);
      await copy(resolve(__dirname, 'test.ts'), resolve(tmpDir, 'src/test.ts'));
      await copy(resolve(__dirname, 'test.js'), resolve(tmpDir, 'test.js'));
    }
  }
}