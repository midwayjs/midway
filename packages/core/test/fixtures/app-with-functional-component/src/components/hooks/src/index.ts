import {
  Provide,
  Inject,
  CustomModuleDetector,
} from '../../../../../../../src';
import { defineConfiguration } from '../../../../../../../src/functional';

@Provide()
class FunctionContainer {
  @Inject()
  ctx;

  async getFunction() {
    return this.ctx.requestContext.getAsync('');
  }
}

export default defineConfiguration({
  detector: new CustomModuleDetector({
    modules: [FunctionContainer],
  }),
  namespace: 'hooks',
  async onReady() {
    console.log('on ready in hooks');
  },
  async onStop() {
    console.log('on ready in hooks');
  }
});
