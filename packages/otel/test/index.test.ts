import { SimpleSpanProcessor, InMemorySpanExporter} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';
import { UserService } from './fixtures/base-app/src/user.service';

describe('/test/index.test.ts', () => {

  it('should test trace decorator', async () => {
    const provider = new NodeTracerProvider();
    const inMemorySpanExporter = new InMemorySpanExporter();
    provider.addSpanProcessor(new SimpleSpanProcessor(inMemorySpanExporter));
    provider.register();

    let app = await createApp(join(__dirname, './fixtures/base-app'));
    const userService = await app.getApplicationContext().getAsync(UserService);
    const data = await userService.invoke();
    expect(data).toEqual({
      test: 1
    });
    await close(app);
    provider.shutdown();

    const spans = inMemorySpanExporter.getFinishedSpans();
    expect(spans.length).toEqual(1);
    expect(spans[0].spanContext()).toBeDefined();
  });
});
