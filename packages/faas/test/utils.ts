import * as FaaS from '../src';
import { Framework } from '../src';
import { join } from 'path';
import { close, create } from '@midwayjs/mock';

const originReady = FaaS.Configuration.prototype.init;
let isProxy = false;
let currentOptions;

export async function creatStarter(name, options = {}): Promise<Framework> {
  currentOptions = options;
  if (!isProxy) {
    FaaS.Configuration.prototype.init = async function () {
      this.framework.configure(currentOptions);
      await this.framework.initialize(currentOptions);
      await originReady.call(this);
    }
    isProxy = true;
  }

  return await create<Framework>(join(__dirname, 'fixtures', name), options, FaaS);
}

export async function closeApp(framework) {
  return close(framework);
}
