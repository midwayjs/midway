import { close, createLightApp } from '@midwayjs/mock';
import { JwtService } from '../src';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  it('should test jwt service', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app'));
    const jwtService = await  app.getApplicationContext().getAsync(JwtService);
    const secret = 'shhhhhh';
    const asyncToken = await jwtService.sign({ foo: 'bar' }, secret, { algorithm: 'HS256' });
    const syncToken = jwtService.signSync({ foo: 'bar' }, secret, { algorithm: 'HS256' });
    expect(typeof asyncToken).toEqual('string');
    expect((asyncToken as string).split('.')).toHaveLength(3);
    expect(asyncToken).toEqual(syncToken);

    const asyncToken1 = await jwtService.sign({ foo: 'bar' }, { algorithm: 'HS256' });
    const syncToken1 = jwtService.signSync({ foo: 'bar' }, { algorithm: 'HS256' });
    expect(asyncToken1).toEqual(syncToken1);

    await close(app);
  });
});
