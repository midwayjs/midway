import { SimpleSpanProcessor, InMemorySpanExporter} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { join } from 'path';
import { createLegacyApp, close, createHttpRequest } from '@midwayjs/mock';
import { UserService } from './fixtures/base-app/src/user.service';

describe('/test/index.test.ts', () => {

  it('should test trace decorator', async () => {
    const provider = new NodeTracerProvider();
    const inMemorySpanExporter = new InMemorySpanExporter();
    provider.addSpanProcessor(new SimpleSpanProcessor(inMemorySpanExporter));
    provider.register();

    let app = await createLegacyApp(join(__dirname, './fixtures/base-app'));
    const userService = await app.getApplicationContext().getAsync(UserService);
    const data = await userService.invoke();
    expect(data).toEqual({
      test: 1
    });

    const res = await createHttpRequest(app).get('/');
    expect(res.text).toBeDefined();

    let error;

    try {
      await userService.invokeError();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();

    await close(app);
    const spans = inMemorySpanExporter.getFinishedSpans();
    expect(spans.length).toEqual(2);
    expect(spans[0].spanContext()).toBeDefined();

    expect(spans[1].events.length).toEqual(1);

    provider.shutdown();
  });
});
