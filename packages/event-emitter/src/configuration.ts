import { Configuration, IMidwayContainer } from '@midwayjs/core';
import { EventEmitterService } from './service';

@Configuration({
  namespace: 'eventEmitter',
})
export class EventEmitterConfiguration {
  async onReady(container: IMidwayContainer) {
    await container.getAsync(EventEmitterService);
  }
}
