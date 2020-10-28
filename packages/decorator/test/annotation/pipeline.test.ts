import {
  Pipeline,
  Provide,
  getPropertyInject,
  getConstructorInject,
  PIPELINE_IDENTIFIER,
  NAMED_TAG,
} from '../../src';

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
    expect(p).toEqual({
      dd: [
        {
          args: undefined,
          key: 'inject',
          value: PIPELINE_IDENTIFIER,
        },
      ],
    });

    expect(p['dd'][0].toString()).toEqual(
      'tagged: { key:inject, value: __pipeline_identifier__ }'
    );

    const c = getConstructorInject(Test);
    expect(c).toEqual({
      0: [
        {
          args: undefined,
          key: 'inject',
          value: PIPELINE_IDENTIFIER,
        },
      ],
    });

    expect(c[0].toString()).toEqual(
      'tagged: { key:inject, value: __pipeline_identifier__ }'
    );

    const meta = c[0][0];
    meta.key = NAMED_TAG;
    expect(meta.toString()).toEqual('named: __pipeline_identifier__ ');
  });
});
