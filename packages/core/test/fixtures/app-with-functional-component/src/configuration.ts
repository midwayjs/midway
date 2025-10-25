import { sleep } from '../../../../src';
import createHooks from './components/hooks';
import { defineConfiguration } from '../../../../src/functional';

export default defineConfiguration({
  imports: [createHooks],
  async onReady() {
    console.log('on ready in main');
  },
  async onStop() {
    console.log('on ready in main');
  },
  async onConfigLoad() {
    await sleep(50);
    return {
      a: 1
    }
  },
});

