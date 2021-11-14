import {
  getClassMetadata,
  getObjectDefinition,
  listModule,
  MS_PROVIDER_KEY,
  ScopeEnum,
  MSProviderType,
  Provider,
  GRPCMetadata
} from '../../src';

@Provider(MSProviderType.GRPC, { package: 'test' })
class TestFun {
}

@Provider(MSProviderType.DUBBO)
class TestFun1 {
}

describe('/test/microservice/provider.test.ts', () => {
  it('test consumer decorator', () => {
    const meta: GRPCMetadata.ProviderMetadata = getClassMetadata(MS_PROVIDER_KEY, TestFun);
    expect(meta).toEqual({ type: MSProviderType.GRPC, metadata: { package: 'test' } });

    const meta2 = getClassMetadata(MS_PROVIDER_KEY, TestFun1);
    expect(meta2).toEqual({ type: MSProviderType.DUBBO, metadata: {} });

    const def = getObjectDefinition(TestFun);
    expect(def).toEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(MS_PROVIDER_KEY);
    expect(m.length).toEqual(2);
  });
});
