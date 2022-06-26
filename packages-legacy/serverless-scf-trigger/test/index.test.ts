import { createRuntime } from '@midwayjs/runtime-mock';
import { join } from 'path';
import { ApiGatewayTrigger, COSTrigger, TimerTrigger } from '../src';
import * as assert from 'assert';
import { CMQTrigger } from '../src/cmq';
import { CKafkaTrigger } from '../src/ckafka';

describe('/test/index.test.ts', () => {
  it('should use origin api gateway', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/apiGateway'),
    });
    await runtime.start();
    const result = await runtime.invoke(new ApiGatewayTrigger());
    assert.equal(result.body, 'hello Alan');
    await runtime.close();
  });

  it('should use origin timer trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/timer'),
    });
    await runtime.start();
    const result = await runtime.invoke(new TimerTrigger());
    assert(result.Time);
    await runtime.close();
  });

  it('should use origin cos trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/cos'),
    });
    await runtime.start();
    const result = await runtime.invoke(new COSTrigger());
    assert(result.Records[0].cos);
    assert(result.Records[0].event);
    await runtime.close();
  });

  it('should use origin cmq trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/cmq'),
    });
    await runtime.start();
    const result = await runtime.invoke(new CMQTrigger());
    assert(result.Records[0].CMQ);
    await runtime.close();
  });

  it('should use origin CKafka trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/ckafka'),
    });
    await runtime.start();
    const result = await runtime.invoke(new CKafkaTrigger());
    assert(result.Records[0].Ckafka);
    await runtime.close();
  });
});
