import { createConfiguration, sleep } from '../../../../src'
import { createHooks } from './components/hooks';

export default createConfiguration({
  imports: [
    createHooks({
      routes: [{
        loadDir: 'lambda',
        prefix: '/api'
      }],
    })
  ]
}).onReady(async (container, app) => {
  console.log('on ready', app);
}).onStop(async (container, app) => {
  console.log('on stop', app);
}).onConfigLoad(async () => {
  await sleep(50);
  return {
    a: 1
  }
})
