import {
  Controller,
  CONTROLLER_KEY,
  listModule,
  getClassMetadata,
  ScopeEnum,
  getObjectDefinition,
} from '../../src';
import {
  ControllerOne,
  ControllerTwo,
} from '../fixtures/decorator/customClass';

@Controller('/hhh', {
  sensitive: true,
  middleware: ['hello'],
  description: 'my controller',
  tagName: 'my'
})
class TestController {}

@Controller('/tt')
class TestOneController {}

describe('/test/web/controller.test.ts', () => {
  it('controller decorator should be ok', () => {
    const meta = getClassMetadata(CONTROLLER_KEY, TestController);
    expect(meta).toStrictEqual({
      prefix: '/hhh',
      routerOptions: {
        description: 'my controller',
        sensitive: true,
        middleware: ['hello'],
        tagName: 'my',
      },
    });

    const metaone = getClassMetadata(CONTROLLER_KEY, TestOneController);
    expect(metaone).toStrictEqual({
      prefix: '/tt',
      routerOptions: {
        sensitive: true,
        middleware: [],
      },
    });

    const def = getObjectDefinition(TestController);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(CONTROLLER_KEY);
    expect(m.length).toEqual(4);
  });

  it('controller extends should be ok', () => {
    const metaone = getClassMetadata(CONTROLLER_KEY, ControllerOne);
    expect(metaone).toStrictEqual({
      prefix: '/api/one',
      routerOptions: {
        sensitive: true,
        middleware: [],
      },
    });

    const metatwo = getClassMetadata(CONTROLLER_KEY, ControllerTwo);
    expect(metatwo).toStrictEqual({
      prefix: '/api/two',
      routerOptions: {
        sensitive: true,
        middleware: [],
      },
    });
  });
});
