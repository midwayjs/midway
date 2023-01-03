import { Configuration } from '../../../../../src';

@Configuration({
  namespace: 'a'
})
export class ContainerConfiguration {
  onReady() {
    process.env.RUN_READY_FLAG = 'a';
  }
  onStop() {
    process.env.RUN_STOP_FLAG = 'a';
  }
}
