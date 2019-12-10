import { Test } from '../../src/provider/default/test';
import * as assert from 'assert';

describe('/test/core/command/test.test.ts', () => {
    const test = new Test({
        serverless: {
            processedInput: {
                options: {}
            },
            pluginManager: {
                serverlessConfigFile: ''
            },
            config: {
                servicePath: __dirname
            },
            cli: console
        }
    });
    it('Test command', async () => {
        const cmd = test.getCommand();
        assert(cmd.test && cmd.test.usage && cmd.test.usage.indexOf('Test') !== -1);
    });
    it('Test hooks', async () => {
        const cmd = test.getHooks();
        try {
            await cmd['test:test']();
        } catch (e) {
            assert(!e);
        }
    });
});
