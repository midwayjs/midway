import {
  Validate,
  Rule,
  RuleType,
  getSchema,
  OmitDto,
  Valid,
  ParseIntPipe,
  ParseFloatPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  DecoratorValidPipe,
  AbstractValidationPipe,
  ValidateService
} from '../src';
import { createLightApp, close } from '@midwayjs/mock';
import * as Joi from 'joi';
import * as valid from '../src';

import * as assert from 'assert';
import { DecoratorManager, Provide, TransformOptions } from '@midwayjs/core';
describe('/test/check.test.ts', () => {
  it('check with check', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });

    class TO {}

    class UserDTO extends TO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    class HelloDTO extends UserDTO {
    }

    @Provide()
    class Hello {
      school(a, @Valid() data: HelloDTO) {
        return data;
      }
    }
    const user = {
      age: 8
    };

    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);

    await close(app);
  });

  it('check with check with extends', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class TO {}

    class UserDTO extends TO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    class HelloDTO extends UserDTO {

      @Rule(RuleType.number().min(4))
      age: number;
    }

    @Provide()
    class Hello {
      school(a, @Valid() data: HelloDTO) {
        return data;
      }
    }
    const user = {
      age: 11
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);

    await close(app);
  });

  it('check with check with options', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(getSchema(WorldDTO))
      world?: WorldDTO;
    }

    @Provide()
    class Hello {
      school(a, @Valid() data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);

    await close(app);
  });

  it('check with check with array', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });

    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(RuleType.array().items(getSchema(WorldDTO)))
      world: WorldDTO[];
    }

    @Provide()
    class Hello {
      async school(a, @Valid() data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: [{
        age: 10
      }, {
        age: 22
      }]
    };

    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);

    let error;
    try {
      await hello.school(1, user);
    } catch (err) {
      error = err;
    }
    expect(error.message).toMatch(/"world\[1\].age" must be less than or equal to 20/);
    await close(app);
  });

  it.skip('check with check and transform object', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(RuleType.string().required())
      firstName: string;

      @Rule(RuleType.string().max(10))
      lastName: string;

      getName?() {
        return this.firstName + ' ' + this.lastName;
      }

      isAdult?() {
        return this.age > 36 && this.age < 60;
      }
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 8,
      firstName: 'Johny',
      lastName: 'Cage',
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    expect(result.getName()).toEqual('Johny Cage');
    assert.deepEqual(result, user);

    await close(app);
  });

  it('check with no @Validate decorator', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    @Provide()
    class Hello {
      async school(a, @Valid() data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 18,
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);

    let error;
    try {
      await hello.school(1, user);
    } catch (err) {
      error = err;
    }

    expect(error.message).toMatch(/"age" must be less than or equal to 10/);

    await close(app);
  });

  it('check with check when vo have two level', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(getSchema(WorldDTO))
      world: WorldDTO;
    }

    @Provide()
    class Hello {
      school(a, @Valid() data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: {
        age: 18,
      },
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);

    await close(app);
  });

  it('check with check when vo have two level not equal', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(getSchema(WorldDTO))
      world: WorldDTO;
    }

    @Provide()
    class Hello {
      async school(a, @Valid() data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: {
        age: 22,
      },
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);

    let error;
    try {
      await hello.school(1, user);
    } catch (err) {
      error = err;
    }
    expect(error.message).toMatch(/"world.age" must be less than or equal to 20/);

    await close(app);
  });

  it('check with check when two level and array and not equal', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(RuleType.array().items(getSchema(WorldDTO)))
      worlds: WorldDTO[];
    }

    @Provide()
    class Hello {
      async school(a, @Valid() data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      worlds: [
        {
          age: 22,
        },
      ],
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);

    let error;
    try {
      await hello.school(1, user);
    } catch (err) {
      error = err;
    }
    expect(error.message).toMatch(/"worlds\[0\].age" must be less than or equal to 20/);

    await close(app);
  });

  it.skip('should transform string to number', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });
    class UserNewDTO {
      @Rule(RuleType.number().required())
      id: number;
    }

    @Provide()
    class Hello {
      school(@Valid() user: UserNewDTO) {
        return user;
      }
    }
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const data = hello.school({
      id: '555'
    } as any)
    expect(typeof data.id).toEqual('number');

    await close(app);
  });

  it('should test joi transform type', function () {
    const schema = Joi.object({
      age: Joi.number()
    });
    const result = schema.validate({
      age: '12'
    });
    expect(typeof result.value.age).toEqual('number');
  });

  it('should test global validate config', async () => {
    const app = await createLightApp('', {
      imports: [valid]
    });

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    @Provide()
    class Hello {
      @Validate({
        validationOptions: {
          allowUnknown: true,
        },
        errorStatus: 400
      })
      async school(@Valid() data: UserDTO) {
        return data;
      }
    }
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);

    let error;
    try {
      await hello.school({
        age: 11
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.status).toEqual(400);

    const result = await hello.school({
      age: 1,
      name: 'hello',
    } as any);
    expect(result['name']).toEqual('hello');

    await close(app);
  });

  it('test cascade with extends check', () => {

    class SchoolDTO {
      @Rule(RuleType.string().required())
      name: string;
      @Rule(RuleType.string())
      address: string;
    }

    class NewSchoolDTO extends OmitDto(SchoolDTO, ['address']) {}

    class UserDTO {
      @Rule(RuleType.array().items(getSchema(NewSchoolDTO)))
      schoolList: NewSchoolDTO[];
    }

    const schema = getSchema(UserDTO);
    const result = schema.validate({
      schoolList: [{
        address: 'abc'
      }]
    });
    console.log(result);
  });

  it.skip('should support extends schema for class and property', async () => {
    class UserDTO {
      @Rule(RuleType.string())
      name?: string;
      @Rule(RuleType.string())
      nickName?: string;
    }

    class Child extends UserDTO {}

    // @Rule(getSchema(SubChild).and('name', 'nickName'))
    // class SubChild extends Child {}

    const app = await createLightApp('', {
      imports: [valid]
    });

    // @Provide()
    // class Hello {
    //   async test(@Valid() user: UserDTO) {
    //     return user;
    //   }
    //
    //   async testChild(@Valid() user: Child) {
    //     return user;
    //   }
    //
    //   async testSubChild(@Valid() user: SubChild) {
    //     return user;
    //   }
    // }

    const rule = getSchema(UserDTO).or('name', 'nickName');
    expect(rule).toBeDefined();
    expect(rule.validate({name: 'abc'}).value).toEqual({name: 'abc'});
    expect(rule.validate({}).error.message).toMatch('contain at least one of [name, nickName]');

    expect(getSchema(Child)).toBeDefined();
    const schema = getSchema(Child);
    expect(schema.validate({name: 'abc'}).value).toEqual({name: 'abc'});
    expect(getSchema(Child).validate({}).error.message).toMatch('contain at least one of [name, nickName]');

    // console.log(getSchema(SubChild));

    await close(app);
  });

  describe('test pipe', () => {
    it('should test getSchema', function () {
      const pipe = new DecoratorValidPipe();
      expect(pipe['getSchema']()).toBeUndefined();
    });

    it('should test AbstractValidationPipe', async () => {

      class UserDTO {
        @Rule(RuleType.number().max(10))
        age: number;
      }

      const validateService = new ValidateService();
      validateService['i18nService'] = {
        getAvailableLocale() {
          return 'en-US';
        }
      } as any;

      validateService['i18nConfig'] = {
        defaultLocale: 'en-US'
      }

      validateService['validateConfig'] = {
        validationOptions: {
          allowUnknown: true
        }
      };
      class CustomValidationPipe extends AbstractValidationPipe {
        transform(value: any, options: TransformOptions) {}
      }

      const pipe = new CustomValidationPipe();
      pipe['validateService'] = validateService;

      // number
      let result = pipe.validate(1, {
        metaType: {
          isBaseType: true,
          originDesign: Number,
          name: 'number',
        },
        metadata: {},
        target: {},
        methodName: 'test',
      });

      expect(result).toEqual(1);

      // string
      result = pipe.validate('bbb', {
        metaType: {
          isBaseType: true,
          originDesign: String,
          name: 'string',
        },
        metadata: {},
        target: {},
        methodName: 'test',
      });

      expect(result).toEqual('bbb');

      // boolean
      result = pipe.validate(true, {
        metaType: {
          isBaseType: true,
          originDesign: Boolean,
          name: 'boolean',
        },
        metadata: {},
        target: {},
        methodName: 'test',
      });

      expect(result).toEqual(true);

      // object
      result = pipe.validate({data: 1}, {
        metaType: {
          isBaseType: false,
          originDesign: Object,
          name: 'object',
        },
        metadata: {},
        target: {},
        methodName: 'test',
      });

      expect(result).toEqual({data: 1});

      // DTO
      result = pipe.validate({age: '10'}, {
        metaType: {
          isBaseType: false,
          originDesign: UserDTO,
          name: 'UserDTO',
        },
        metadata: {},
        target: {},
        methodName: 'test',
      });

      expect(result).toEqual({age: 10});

      result = pipe.validateWithSchema(1, {
        metaType: {
          isBaseType: true,
          originDesign: Number,
          name: 'number',
        },
        metadata: {},
        target: {},
        methodName: 'test',
      }, undefined);

      expect(result).toEqual(1);
    });

    it('should test ParseIntPipe', async () => {

      function TestPipe(pipe: any) {
        return DecoratorManager.createCustomParamDecorator('testPipe', '', {
          impl: false,
          pipes: [pipe]
        });
      }

      const app = await createLightApp('', {
        imports: [valid]
      });

      @Provide()
      class Hello {
        async test(@TestPipe(ParseIntPipe) data: number) {
          return data;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test('1' as any)).toEqual(1);
      expect(await hello.test(-1)).toEqual(-1);
      let error;
      try {
        await hello.test(1.1);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must be an integer");

      try {
        await hello.test(null);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must be a number");

      await close(app);
    });

    it('should test ParseFloatPipe', async () => {

      function TestPipe(pipe: any) {
        return DecoratorManager.createCustomParamDecorator('testPipe', '', {
          impl: false,
          pipes: [pipe]
        });
      }

      const app = await createLightApp('', {
        imports: [valid]
      });

      @Provide()
      class Hello {
        async test(@TestPipe(ParseFloatPipe) data: number) {
          return data;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test('1.1' as any)).toEqual(1.1);
      expect(await hello.test(-1)).toEqual(-1);
      expect(await hello.test(1.1)).toEqual(1.1);
      let error;
      try {
        await hello.test('1.1n' as any);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must be a number");

      try {
        await hello.test(null);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must be a number");

      await close(app);
    });

    it('should test ParseBoolPipe', async () => {
      function TestPipe(pipe: any) {
        return DecoratorManager.createCustomParamDecorator('testPipe', '', {
          impl: false,
          pipes: [pipe]
        });
      }

      const app = await createLightApp('', {
        imports: [valid]
      });

      @Provide()
      class Hello {
        async test(@TestPipe(ParseBoolPipe) data: boolean) {
          return data;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test('true' as any)).toEqual(true);
      expect(await hello.test('false' as any)).toEqual(false);
      expect(await hello.test(true)).toEqual(true);
      expect(await hello.test(false)).toEqual(false);

      let error;
      try {
        await hello.test('0' as any);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must be a boolean");

      try {
        await hello.test(1 as any);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must be a boolean");

      try {
        await hello.test(null);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must be a boolean");

      await close(app);
    });

    it('should test DefaultValuePipe', async () => {
      function TestPipe(pipe: any) {
        return DecoratorManager.createCustomParamDecorator('testPipe', '', {
          impl: false,
          pipes: [pipe]
        });
      }

      const app = await createLightApp('', {
        imports: [valid]
      });

      @Provide()
      class Hello {
        async test(@TestPipe(new DefaultValuePipe('bbb')) data?: string, @TestPipe(new DefaultValuePipe('bbb')) data1?: string) {
          return data + data1;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test('ppp')).toEqual('pppbbb');
      await close(app);
    });

    it('should test @Valid with other decorator', async () => {
      function TestPipe(pipe: any) {
        return DecoratorManager.createCustomParamDecorator('testPipe', '', {
          impl: false,
          pipes: [pipe]
        });
      }

      const app = await createLightApp('', {
        imports: [valid]
      });

      @Provide()
      class Hello {
        async test(@Valid(RuleType.string().min(3).max(4)) @TestPipe(new DefaultValuePipe('bbb')) data?: string) {
          return data;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test()).toEqual('bbb');


      let error;
      try {
        await hello.test('hello world');
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" length must be less than or equal to 4 characters long");
      await close(app);
    });

    it('should test @Validate can change valid pipe', async () => {
      const app = await createLightApp('', {
        imports: [valid]
      });

      @Provide()
      class Hello {
        @Validate({
          errorStatus: 401,
        })
        async test(@Valid(RuleType.string().min(3).max(4)) data?: string) {
          return data;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      let error;
      try {
        await hello.test('hello world');
      } catch (err) {
        error = err;
      }

      expect(error.status).toEqual(401);
      await close(app);
    });

    it('should test @Valid with DTO schema', async () => {
      class UserDTO {
        @Rule(RuleType.string())
        name?: string;
        @Rule(RuleType.string())
        nickName?: string;
      }

      const app = await createLightApp('', {
        imports: [valid]
      });

      @Provide()
      class Hello {
        async test(@Valid(getSchema(UserDTO).or('name', 'nickName')) user: UserDTO) {
          return user;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test({
        name: 'hello world',
      })).toEqual({
        name: 'hello world',
      })

      let error;
      try {
        await hello.test({});
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("\"value\" must contain at least one of [name, nickName]");
      await close(app);
    });
  });
});
