import { close, createLightApp } from '@midwayjs/mock';
import { JwtService } from '../src';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  it('should test jwt', async () => {
    const app = await createLightApp(join(__dirname, './fixtures/base-app'));
    const jwtService = await  app.getApplicationContext().getAsync(JwtService);

    // sign
    const secret = 'shhhhhh';
    const asyncToken = await jwtService.sign({ foo: 'bar' }, secret, { algorithm: 'HS256' });
    const syncToken = jwtService.signSync({ foo: 'bar' }, secret, { algorithm: 'HS256' });
    expect(typeof asyncToken).toEqual('string');
    expect((asyncToken as string).split('.')).toHaveLength(3);
    expect(asyncToken).toEqual(syncToken);

    const asyncToken1 = await jwtService.sign({ foo: 'bar' }, { algorithm: 'HS256' });
    const syncToken1 = jwtService.signSync({ foo: 'bar' }, { algorithm: 'HS256' });
    expect(asyncToken1).toEqual(syncToken1);

    // verify
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE0MzcwMTg1ODIsImV4cCI6MTQzNzAxODU5Mn0.3aR3vocmgRpG05rsI9MpR6z2T_BGtMQaPq2YR6QaroU';
    const key = 'key';

    const payload = {foo: 'bar', iat: 1437018582, exp: 1437018592};
    const p = await jwtService.verify(token, key, {algorithms: ['HS256'], ignoreExpiration: true});
    expect(p).toEqual(payload);

    const p1 = jwtService.verifySync(token, key, {algorithms: ['HS256'], ignoreExpiration: true});
    expect(p1).toEqual(payload);

    const decoded = jwtService.decode("null");
    expect(decoded).toEqual(null);

    const decoded1 = jwtService.decodeSync("null");
    expect(decoded1).toEqual(null);

    await close(app);
  });
});
