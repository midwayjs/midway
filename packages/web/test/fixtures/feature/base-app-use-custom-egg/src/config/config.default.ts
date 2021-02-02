import { join } from 'path';

export = (appInfo) => {

  return {
    keys: 'key',
    hello: {
      a: 1,
      b: 2,
      d: [1, 2, 3],
    },
    rundir: join(appInfo.appDir, 'run'),
    midwayFeature: {
      replaceEggLogger: true,
    }
  }
}
