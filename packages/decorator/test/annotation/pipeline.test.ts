
import { expect } from 'chai';
import { Pipeline, Provide, getPropertyInject, getConstructorInject, PIPELINE_IDENTIFIER, NAMED_TAG } from '../../src';

@Provide()
class Test {
  constructor(@Pipeline() tt: any) {
    // ignore
  }

  @Pipeline()
  dd: any;
}

describe('/test/annotation/pipeline.test.ts', () => {
  it('pipeline decorator should be ok', () => {
    const p = getPropertyInject(Test);
    expect(p).deep.eq({
      dd: [
        {
          args: undefined,
          key: 'inject',
          value: PIPELINE_IDENTIFIER
        },
      ],
    });

    expect(p['dd'][0].toString()).eq('tagged: { key:inject, value: __pipeline_identifier__ }');

    const c = getConstructorInject(Test);
    expect(c).deep.eq({
      0: [{
        args: undefined,
        key: 'inject',
        value: PIPELINE_IDENTIFIER
      }]
    });

    expect(c[0].toString()).eq('tagged: { key:inject, value: __pipeline_identifier__ }');

    const meta = c[0][0];
    meta.key = NAMED_TAG;
    expect(meta.toString()).eq('named: __pipeline_identifier__ ');
  });
});
