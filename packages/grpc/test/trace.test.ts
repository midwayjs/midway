import { join } from 'path';
import { GRPCClients } from '../src/comsumer/clients';

describe('/test/trace.test.ts', () => {
  it('should inject context for grpc client metadata', async () => {
    const clients = new GRPCClients();
    const injectContext = jest.fn();
    (clients as any).traceService = {
      injectContext,
    };

    await clients.createClient({
      package: 'helloworld',
      protoPath: join(__dirname, 'fixtures/proto/helloworld.proto'),
      url: 'localhost:6565',
    } as any);

    const service = clients.getService<any>('helloworld.Greeter');
    const request = service.sayHello();

    expect(request).toBeDefined();
    expect(injectContext).toHaveBeenCalled();
  });
});
