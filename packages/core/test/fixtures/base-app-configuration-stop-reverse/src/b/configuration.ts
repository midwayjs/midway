import { Configuration } from '../../../../../src';

@Configuration({
  namespace: 'b'
})
export class ContainerConfiguration {
  onReady() {
    if (process.env.RUN_READY_FLAG === 'a') {
      process.env.RUN_READY_FLAG = 'b';
    } else {
      throw new Error('b is before a');
    }
  }
  onStop() {
    if (process.env.RUN_STOP_FLAG) {
      throw new Error('b is after a');
    }
    process.env.RUN_STOP_FLAG = 'b';
  }
}
