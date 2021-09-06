import { createConfiguration } from '../../../../src'
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
  return {
    a: 1
  }
})
