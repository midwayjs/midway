import { createCustomJoi } from '../src/proxy';

describe('test/i18n.test.ts', function () {
  it('should test proxy joi', function () {
    const customJoi = createCustomJoi();
    const { error } = customJoi.object({ number: customJoi.string() }).validate({ number: 1 }, {
      errors: {
        language: 'zh-cn'
      }
    });
    expect(error).toBeDefined();
    console.log(error);
    // expect(error).to.have.nested.property('details[0].message', `"number" 은(는) 숫자 형태여야 합니다`);
  });
});
