import {
  getClassMetadata,
  getObjectDefProps,
  listModule,
  MS_PROVIDER_KEY,
  ScopeEnum,
  DecoratorMetadata,
  MSProviderType,
  Provider
} from '../../src';
import ProviderClassMetadata = DecoratorMetadata.ProviderClassMetadata;

@Provider(MSProviderType.GRPC, { package: 'test' })
class TestFun {
}

@Provider(MSProviderType.DUBBO)
class TestFun1 {
}

describe('/test/microservice/provider.test.ts', () => {
  it('test consumer decorator', () => {
    const meta: ProviderClassMetadata = getClassMetadata(MS_PROVIDER_KEY, TestFun);
    expect(meta).toEqual({ type: MSProviderType.GRPC, metadata: { package: 'test' } });

    const meta2: ProviderClassMetadata = getClassMetadata(MS_PROVIDER_KEY, TestFun1);
    expect(meta2).toEqual({ type: MSProviderType.DUBBO, metadata: {} });

    const def = getObjectDefProps(TestFun);
    expect(def).toEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(MS_PROVIDER_KEY);
    expect(m.length).toEqual(2);
  });
});
