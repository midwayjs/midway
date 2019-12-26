import { Cli } from '@midwayjs/faas-local';
import { Invoke } from './invoke.plugin';
export { Test } from '@midwayjs/faas-local';
export { Invoke } from './invoke.plugin';
export class AliCli extends Cli {
    commands: any;
    loadPlatformPlugin() {
       console.log('platform plugin');
    }

    loadCommandInvoke() {
        this.core.addPlugin(Invoke);
    }
}
