// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/decorator';

@Configuration({
  imports: [],
  namespace: 'SQL',
})
export class ContainerLifeCycle {

  @Inject()
  baseDir;

  async onReady(container) {
    console.log('---', this.baseDir);
    container.registerObject('aaa', 'bbbb');
  }
}
