import {
  Pipeline,
  Provide,
  getPropertyInject,
  PIPELINE_IDENTIFIER,
} from '../../src';

@Provide()
class Test {
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
  });
});
