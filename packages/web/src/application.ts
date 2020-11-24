import { join } from 'path';
import {
  createAppWorkerLoader,
  createEggApplication,
  createAgentWorkerLoader,
  createEggAgent,
} from './base';

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

const EggAppWorkerLoader = createAppWorkerLoader();

const BaseEggApplication = createEggApplication();

const EggAgentWorkerLoader = createAgentWorkerLoader();

const BaseEggAgent = createEggAgent();

class EggApplication extends BaseEggApplication {
  get [EGG_LOADER]() {
    return EggAppWorkerLoader;
  }

  get [EGG_PATH]() {
    return join(__dirname, '../');
  }
}

class EggAgent extends BaseEggAgent {
  get [EGG_LOADER]() {
    return EggAgentWorkerLoader;
  }

  get [EGG_PATH]() {
    return join(__dirname, '../');
  }
}

export { EggApplication as Application };
export { EggAgent as Agent };
