import * as Joi from 'Joi';

describe('test/i18n.test.ts', function () {
  it('should test proxy joi', function () {
    const { error } = Joi.object({ number: Joi.string() }).validate({ number: 1 }, {
      errors: (err) => {
        console.log(err);
      }
    } as any);
    expect(error).toBeDefined();
    console.log(error);
    // expect(error).to.have.nested.property('details[0].message', `"number" 은(는) 숫자 형태여야 합니다`);
  });
});
