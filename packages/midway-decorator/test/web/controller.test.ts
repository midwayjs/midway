
import { expect } from 'chai';
import { Controller, CONTROLLER_KEY, listModule, getClassMetadata, ScopeEnum, getObjectDefProps } from '../../src';

@Controller('/hhh', {
  sensitive: true,
  middleware: ['hello']
})
class TestController {}

@Controller('/tt')
class TestOneController {}

describe('/test/web/controller.test.ts', () => {
  it('controller decorator should be ok', () => {
    const meta = getClassMetadata(CONTROLLER_KEY, TestController);
    expect(meta).deep.eq({
      prefix: '/hhh',
      routerOptions: {
        sensitive: true,
        middleware: ['hello']
      }
    });

    const metaone = getClassMetadata(CONTROLLER_KEY, TestOneController);
    expect(metaone).deep.eq({
      prefix: '/tt',
      routerOptions: {
        sensitive: true,
        middleware: []
      }
    });

    const def = getObjectDefProps(TestController);
    expect(def).deep.eq({
      scope: ScopeEnum.Request,
    });

    const m = listModule(CONTROLLER_KEY);
    expect(m.length).eq(2);
  });
});
