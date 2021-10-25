import {
  App,
  getClassMetadata,
  INJECT_CUSTOM_PROPERTY,
} from '../../src';

class Test {
  @App()
  hhh: any;
}

describe('/test/framework/app.test.ts', () => {
  it('app decorator should be ok', () => {
    let data = getClassMetadata(INJECT_CUSTOM_PROPERTY, Test);
    expect(data).toMatchSnapshot();
  });
});
