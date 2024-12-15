import { defineConfiguration } from '../../../../../src/functional';

export default defineConfiguration({
  namespace: 'home-prefix',
  async onReady() {
    console.log('home configuration onReady');
  }
});
