import {
  createConfiguration,
} from '../../../../../../../src';

import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class FunctionContainer {
  @Inject()
  ctx;

  async getFunction() {
    return this.ctx.requestContext.getAsync('');
  }
}

export const createHooks = (hooksOptions) => {

  const configuration = createConfiguration({
    namespace: 'hooks',
  }).onReady(async () => {
    console.log('on ready in hooks');
  }).onStop(async () => {
    console.log('on ready in hooks');
  });

  return {
    Configuration: configuration,
  }
}
