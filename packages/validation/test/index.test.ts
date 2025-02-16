import { createLightApp, close, createHttpRequest } from '@midwayjs/mock';
import { ValidationService } from '../src/service';
import { MidwayValidationError } from '../src/error';
import { mockValidatorOne, mockValidatorTwo } from './mock';
import * as validation from '../src';
import { Controller, Post, Body, Provide, TransformOptions, DecoratorManager, Pipe, IMidwayContainer, MidwayFrameworkService } from '@midwayjs/core';
import {
  Validate,
  Rule,
  Valid,
  DecoratorValidPipe,
  AbstractValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '../src';
import * as koa from '@midwayjs/koa';
import { Catch } from '@midwayjs/core';
import { defineConfiguration } from '@midwayjs/core/functional';

describe('test/index.test.ts', () => {
  describe('validation service test with mock validator one', () => {
    let app;

    beforeEach(async () => {
      app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              mock: async () => mockValidatorOne
            },
            defaultValidator: 'mock'
          }
        }
      });
    });

    afterEach(async () => {
      await close(app);
    });

    it('should validate string successfully', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = { type: 'string' };
      const value = 'hello';
      const result = await validationService.validateWithSchema(schema, value);
      expect(result.value).toEqual('hello_one');
    });

    it('should throw error for invalid string', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = { type: 'string' };
      const value = 123;
      try {
        await validationService.validateWithSchema(schema, value);
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Expected string');
      }
    });

    it('should validate number successfully', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = { type: 'number' };
      const value = 42;
      const result = await validationService.validateWithSchema(schema, value);
      expect(result.value).toEqual(42);
    });

    it('should throw error for invalid number', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = { type: 'number' };
      const value = '42';
      try {
        await validationService.validateWithSchema(schema, value);
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Expected number');
      }
    });
  });

  describe('validation service test with mock validator two', () => {
    let app;

    beforeEach(async () => {
      app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              mock: async () => mockValidatorTwo
            },
            defaultValidator: 'mock'
          }
        }
      });
    });

    afterEach(async () => {
      await close(app);
    });

    it('should validate object successfully', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = {
        kind: 'object',
        shape: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const value = { name: 'harry', age: 18 };
      const result = await validationService.validateWithSchema(schema, value);
      expect(result.value).toEqual({ name: 'harry_two', age: 18 });
    });

    it('should throw error for missing required field', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = {
        kind: 'object',
        shape: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const value = { name: 'harry' };
      try {
        await validationService.validateWithSchema(schema, value);
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Missing required field: age');
      }
    });
  });

  describe('validation with @Valid test', () => {
    let app;

    class WorldDTO {
      @Rule({ type: 'number' })
      age: number;
    }

    class UserDTO {
      @Rule({ type: 'string' })
      username: string;

      @Rule({ type: 'number' })
      age: number;

      @Rule({ type: 'object', optional: true })
      world?: WorldDTO;
    }

    @Provide()
    class Hello {
      async test(@Valid() user: UserDTO) {
        return user;
      }

      async testWithoutValid(user: UserDTO) {
        return user;
      }

      async testNested(@Valid() user: UserDTO) {
        return user;
      }

      @Validate({
        errorStatus: 400
      })
      async testWithCustomOptions(@Valid() user: UserDTO) {
        return user;
      }
    }

    beforeEach(async () => {
      app = await createLightApp({
        imports: [validation],
        preloadModules: [Hello],
        globalConfig: {
          validation: {
            validators: {
              mock: async () => mockValidatorTwo
            },
            defaultValidator: 'mock',
            errorStatus: 422
          }
        }
      });
    });

    afterEach(async () => {
      await close(app);
    });

    it('should validate with @Valid successfully', async () => {
      const hello = await app.getApplicationContext().getAsync(Hello);
      const result = await hello.test({
        username: 'harry',
        age: 18,
        world: {
          age: 15
        }
      });
      expect(result).toEqual({
        username: 'harry_two',
        age: 18,
        world: {
          age: 15
        }
      });
    });

    it('should throw error when validation fails with @Valid', async () => {
      const hello = await app.getApplicationContext().getAsync(Hello);
      try {
        await hello.test({
          username: 123,  // should be string
          age: '18'      // should be number
        });
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Expected string');
      }
    });
  });

  describe('validation middleware test', () => {
    let app;

    class UserDTO {
      @Rule({ type: 'string' })
      username: string;

      @Rule({ type: 'number' })
      age: number;
    }

    @Controller('/api')
    class UserController {
      @Post('/users')
      @Validate()
      async createUser(@Body() @Valid() user: UserDTO) {
        return user;
      }
    }

    @Catch(MidwayValidationError)
    class DefaultErrorHandler {
      catch(err: MidwayValidationError, ctx: any) {
        ctx.status = 422;
        ctx.body = {
          message: err.cause?.message || err.message
        };
      }
    }

    const configuration = defineConfiguration({
      async onReady(container: IMidwayContainer): Promise<void> {
        (await container.getAsync(MidwayFrameworkService)).getFramework('koa').useFilter(DefaultErrorHandler);
      }
    });

    beforeAll(async () => {
      app = await createLightApp({
        imports: [koa, validation, configuration],
        preloadModules: [UserController, DefaultErrorHandler],
        globalConfig: {
          keys: '123456',
          validation: {
            validators: {
              mock: async () => mockValidatorOne
            },
            defaultValidator: 'mock',
            throwValidateError: true
          }
        }
      });
    });

    afterAll(async () => {
      await close(app);
    });

    it('should validate request body successfully', async () => {
      const result = await createHttpRequest(app)
        .post('/api/users')
        .send({
          username: 'harry',
          age: 18,
        });

      expect(result.status).toBe(422);
      expect(result.body).toEqual({
        message: 'Missing required field: username'
      });
    });

    it('should return error for invalid request body', async () => {
      const result = await createHttpRequest(app)
        .post('/api/users')
        .send({
          username: 123,
          age: '18',
        });

      expect(result.status).toBe(422);
      expect(result.body).toEqual({
        message: 'Missing required field: username'
      });
    });
  });

  describe('test pipe', () => {
    it('should test getSchema', function () {
      const pipe = new DecoratorValidPipe();
      expect(pipe['getSchema']()).toBeUndefined();
    });

    it('should test AbstractValidationPipe', async () => {
      @Pipe()
      class CustomValidationPipe extends AbstractValidationPipe {
        transform(value: any, options: TransformOptions) {
          return value;
        }
      }

      const app = await createLightApp({
        imports: [validation],
        preloadModules: [CustomValidationPipe],
        globalConfig: {
          validation: {
            validators: {
              mock: async () => mockValidatorTwo
            },
            defaultValidator: 'mock',
            throwValidateError: false,
          }
        }
      });

      class UserDTO {
        @Rule({ type: 'number', max: 10 })
        age: number;
      }

      const pipe = app.getApplicationContext().get(CustomValidationPipe);

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
      result = pipe.validate({age: 10}, {
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

      await close(app);
    });

    it('should test ParseIntPipe', async () => {
      function TestPipe(pipe: any) {
        return DecoratorManager.createCustomParamDecorator('testPipe', '', {
          impl: false,
          pipes: [pipe]
        });
      }

      @Provide()
      class Hello {
        async test(@TestPipe(ParseIntPipe) data: number) {
          return data;
        }
      }

      const app = await createLightApp({
        imports: [validation],
        preloadModules: [Hello],
        globalConfig: {
          validation: {
            validators: {
              mock: async () => mockValidatorTwo
            },
            defaultValidator: 'mock',
            throwValidateError: false
          }
        }
      });

      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test(1)).toEqual(1);
      expect(await hello.test(-1)).toEqual(-1);

      try {
        await hello.test(1.1);
      } catch (err) {
        expect(err.message).toContain('Expected number');
      }

      try {
        await hello.test(null as any);
      } catch (err) {
        expect(err.message).toContain('Expected number');
      }

      await close(app);
    });

    it('should test @Valid with other decorator', async () => {
      function TestPipe(pipe: any) {
        return DecoratorManager.createCustomParamDecorator('testPipe', '', {
          impl: false,
          pipes: [pipe]
        });
      }

      const app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              mock: async () => mockValidatorTwo
            },
            defaultValidator: 'mock',
            throwValidateError: false
          }
        }
      });

      @Provide()
      class Hello {
        async test(@Valid({ type: 'string', min: 3, max: 4 }) @TestPipe(new DefaultValuePipe('bbb')) data?: string) {
          return data || '';
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test()).toEqual('bbb_two');

      try {
        await hello.test('hello world');
      } catch (err) {
        expect(err.message).toContain('Expected string');
      }

      await close(app);
    });

    it('should test @Valid with DTO schema', async () => {
      class UserDTO {
        @Rule({ type: 'string', optional: true })
        name?: string;

        @Rule({ type: 'string', optional: true })
        nickName?: string;
      }

      const app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              mock: async () => mockValidatorTwo
            },
            defaultValidator: 'mock',
            throwValidateError: true
          }
        }
      });

      @Provide()
      class Hello {
        async test(@Valid({
          kind: 'object',
          shape: {
            name: { type: 'string', optional: true },
            nickName: { type: 'string', optional: true }
          }
        }) user: UserDTO) {
          return user;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test({
        name: 'hello world',
      })).toEqual({
        name: 'hello world_two',
      });

      try {
        await hello.test({});
      } catch (err) {
        expect(err.message).toContain('至少需要一个字段 name 或 nickName');
      }

      await close(app);
    });
  });

  describe('multiple validators test', () => {
    let app;

    beforeEach(async () => {
      app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              mockOne: async () => mockValidatorOne,
              mockTwo: async () => mockValidatorTwo
            },
            defaultValidator: 'mockOne'
          }
        }
      });
    });

    afterEach(async () => {
      await close(app);
    });

    it('should use default validator (mockOne) when no validator specified', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = { type: 'string' };
      const value = 'hello';
      const result = await validationService.validateWithSchema(schema, value);
      expect(result.value).toEqual('hello_one');
    });

    it('should throw error with default validator (mockOne)', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = { type: 'string' };
      const value = 123;
      try {
        await validationService.validateWithSchema(schema, value);
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Expected string');
      }
    });

    it('should validate using mockTwo validator when specified', async () => {
      class UserDTO {
        @Rule({ type: 'string', kind: 'string'})
        name: string;

        @Rule({ type: 'number', kind: 'number'})
        age: number;
      }

      @Provide()
      class Hello {
        @Validate({
          defaultValidator: 'mockTwo',
        })
        async test(@Valid() user: UserDTO) {
          return user;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      const result = await hello.test({
        name: 'harry',
        age: 18
      });

      expect(result).toEqual({
        name: 'harry_two',
        age: 18
      });
    });

    it('should throw error with mockTwo validator when validation fails', async () => {
      class UserDTO {
        @Rule({ type: 'string', kind: 'string' })
        name: string;

        @Rule({ type: 'number', kind: 'number' })
        age: number;
      }

      @Provide()
      class Hello {
        async test(@Valid() user: UserDTO) {
          return user;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      try {
        await hello.test({
          name: 123,  // should be string
          age: '18'   // should be number
        });
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Expected string');
      }
    });

    it('should validate with different validator in ValidationService.validate', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);

      class UserDTO {
        @Rule({ type: 'string' })
        name: string;
      }

      // 使用 mockOne 验证
      const result1 = await validationService.validate(UserDTO, {
        name: 'harry'
      }, {
        defaultValidator: 'mockOne',
        throwValidateError: true
      });
      expect(result1.value).toEqual({ name: 'harry_one' });  // mockOne 会加上 '_one'

      // 使用 mockTwo 验证
      const result2 = await validationService.validate(UserDTO, {
        name: 'harry'
      }, {
        defaultValidator: 'mockTwo',
        throwValidateError: true
      });
      expect(result2.value).toEqual({ name: 'harry_two' });  // mockTwo 会加上 '_two'
    });

    it('should validate with different validator in ValidationService.validateWithSchema', async () => {
      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const schema = { type: 'string' };

      // 使用 mockOne 验证
      const result1 = await validationService.validateWithSchema(schema, 'hello', {
        defaultValidator: 'mockOne'
      });
      expect(result1.value).toEqual('hello_one');  // mockOne 会加上 '_one'

      // 使用 mockTwo 验证
      const result2 = await validationService.validateWithSchema(schema, 'hello', {
        defaultValidator: 'mockTwo'
      });
      expect(result2.value).toEqual('hello_two');  // mockTwo 会加上 '_two'
    });

    it('should validate with different validator in @Validate decorator', async () => {
      class UserDTO {
        @Rule({ type: 'string', kind: 'string' })
        name: string;
      }

      @Provide()
      class Hello {
        @Validate({
          defaultValidator: 'mockOne',
          throwValidateError: true
        })
        async testWithMockOne(@Valid() user: UserDTO) {
          return user;
        }

        @Validate({
          defaultValidator: 'mockTwo',
          throwValidateError: true
        })
        async testWithMockTwo(@Valid() user: UserDTO) {
          return user;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      // 使用 mockOne 验证
      const result1 = await hello.testWithMockOne({
        name: 'harry'
      });
      expect(result1).toEqual({ name: 'harry_one' });  // mockOne 会加上 '_one'

      // 使用 mockTwo 验证
      const result2 = await hello.testWithMockTwo({
        name: 'harry'
      });
      expect(result2).toEqual({ name: 'harry_two' });  // mockTwo 会加上 '_two'

      // 验证失败的情况
      try {
        await hello.testWithMockOne({
          name: 123 // should be string
        });
      } catch (err) {
        expect(err.message).toContain('Expected string');
      }

      try {
        await hello.testWithMockTwo({
          name: 123 // should be string
        });
      } catch (err) {
        expect(err.message).toContain('Expected string');
      }
    });
  });
});

