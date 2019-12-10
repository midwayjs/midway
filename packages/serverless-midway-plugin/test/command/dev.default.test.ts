import { Dev } from '../../src/provider/default/dev';
import * as assert from 'assert';

describe('/test/core/command/dev.default.test.ts', () => {
    const dev = new Dev();
    it('Dev command', async () => {
        const cmd = dev.getCommand();
        assert(cmd);
    });
    it('Dev hooks', async () => {
        const cmd = dev.getHooks();
        assert(cmd);
    });
});
