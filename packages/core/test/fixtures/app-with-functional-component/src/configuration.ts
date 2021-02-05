import { createConfiguration } from '../../../../src'
import { createHooks } from './components/book';

export default createConfiguration({
  imports: [
    createHooks({
      routes: [{
        loadDir: './lambda',
        prefix: '/api'
      }],
    })
  ]
}).onReady(async () => {
})
