import { Deploy } from '../../src/provider/default/deploy';
import * as assert from 'assert';

describe('/test/core/command/deploy.default.test.ts', () => {
    const deploy = new Deploy();
    it('Deploy command', async () => {
        const cmd = deploy.getCommand();
        assert(cmd);
    });
    it('Deploy hooks', async () => {
        const cmd = deploy.getHooks();
        const fun = cmd['after:deploy:midway-deploy'];
        assert(fun && fun() === undefined);
    });
});
