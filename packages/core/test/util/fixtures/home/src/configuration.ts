import { defineConfiguration } from '../../../../../src/functional';

export default defineConfiguration({
  namespace: 'home',
  async onReady() {
    console.log('home configuration onReady');
  }
});
