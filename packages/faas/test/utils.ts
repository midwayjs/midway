import { Framework, Application } from '../src';
import * as FaaS from '../src';
import { join } from 'path';
import { close, create, createApp } from '@midwayjs/mock';
import { FC } from '../../../packages-serverless/serverless-starter/src'

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

  return await create<Framework>(join(__dirname, 'fixtures/legacy', name), options, FaaS);
}

export async function createNewStarter(name, options = {}): Promise<Application> {
  const app = await createApp<Framework>(join(__dirname, 'fixtures', name), Object.assign({
    starter: new FC.BootstrapStarter(),
    imports: [
      require('../src')
    ]
  }, options));
  return app;
}

export async function closeApp(framework) {
  return close(framework);
}
