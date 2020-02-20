import { schedule } from '@midwayjs/decorator'

import { provide } from 'injection'

@provide()
@schedule({
  type: 'worker',
  interval: 2333,
})
export default class HelloCron {

  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello')
  }

}
