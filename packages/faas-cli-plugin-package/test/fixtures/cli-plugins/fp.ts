import {
  BasePlugin,
} from '@midwayjs/fcli-command-core';
export class FpPackagePlugin extends BasePlugin {
  hooks = {
    'after:package:emit': async () => {
      this.core.service.functions['fp'] = {
        handler: 'fp.handler',
        isFunctional: true,
        exportFunction: 'fp',
        sourceFilePath: 'fun-index.js',
        events: [
          {
            http: {
              method: 'get',
              path: '/api/fp'
            }
          }
        ]
      }
    }
  }
}