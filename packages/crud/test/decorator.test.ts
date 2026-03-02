import { Crud, CrudConfigError, getCrudOptions, isCrudController } from '../src';

class TestModel {}
class TestService {}

describe('crud decorators', () => {
  it('should reject missing options', () => {
    expect(() => Crud(undefined as any)).toThrow(CrudConfigError);
    expect(() => Crud(null as any)).toThrow('Crud options are required');
  });

  it('should reject missing model or service', () => {
    expect(() =>
      Crud({
        service: TestService as any,
      } as any)
    ).toThrow('Crud option "model" is required');

    expect(() =>
      Crud({
        model: TestModel,
      } as any)
    ).toThrow('Crud option "service" is required');
  });

  it('should persist metadata and identify crud controllers', () => {
    @Crud({
      model: TestModel,
      service: TestService as any,
    })
    class TestController {}

    expect(getCrudOptions(TestController)).toMatchObject({
      model: TestModel,
      service: TestService,
    });
    expect(isCrudController(TestController)).toBe(true);
    expect(isCrudController(class PlainController {})).toBe(false);
  });
});
