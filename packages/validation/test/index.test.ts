import { createLightApp, close, createHttpRequest } from '@midwayjs/mock';
import { ValidationService } from '../src/service';
import { MidwayValidationError } from '../src/error';
import { mockValidationService } from './mock';
import * as validation from '../src';
import { Controller, Post, Body, Catch, Provide, TransformOptions, DecoratorManager, Pipe } from '@midwayjs/core';
import {
  Validate,
  Rule,
  Valid,
  DecoratorValidPipe,
  AbstractValidationPipe,
  ParseIntPipe, DefaultValuePipe,
} from '../src';
import * as koa from '@midwayjs/koa';
import { z } from 'zod';

describe('test/index.test.ts', () => {
  describe('validation service test', () => {
    let app;

    beforeEach(async () => {
      app = await createLightApp({
        imports: [validation],
      });
      const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
      validationServiceStore.setValidationService(mockValidationService);
    });

    afterEach(async () => {
      await close(app);
    });

    it('should validate string successfully', async () => {
      const validationService = app.getApplicationContext().get(ValidationService);
      const schema = z.string().min(3);
      const value = 'hello';
      const result = await validationService.validateWithSchema(schema, value);
      expect(result.value).toEqual('hello');
    });

    it('should throw error for invalid string', async () => {
      const validationService = app.getApplicationContext().get(ValidationService);
      const schema = z.string().min(3);
      const value = 'hi';
      try {
        await validationService.validateWithSchema(schema, value);
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('String must contain at least 3 character(s)');
      }
    });

    it('should validate number successfully', async () => {
      const validationService = app.getApplicationContext().get(ValidationService);
      const schema = z.number().int().min(0);
      const value = 42;
      const result = await validationService.validateWithSchema(schema, value);
      expect(result.value).toEqual(42);
    });

    it('should throw error for invalid number', async () => {
      const validationService = app.getApplicationContext().get(ValidationService);
      const schema = z.number().int().min(0);
      const value = -1;
      try {
        await validationService.validateWithSchema(schema, value);
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Number must be greater than or equal to 0');
      }
    });
  });

  describe('validation with @Valid test', () => {
    let app;

    class WorldDTO {
      @Rule(z.number().int().min(0).max(20))
      age: number;
    }

    class UserDTO {
      @Rule(z.string().min(3))
      username: string;

      @Rule(z.number().int().min(0))
      age: number;

      @Rule(z.object({
        age: z.number().int().min(0).max(20)
      }))
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
          validate: {
            errorStatus: 422
          },
          i18n: {
            defaultLocale: 'en_US',
            localeTable: {
              en_US: {
                validate: {
                  min: 'The minimum length is {0}.'
                }
              },
              zh_CN: {
                validate: {
                  min: '最小长度为 {0}.'
                }
              }
            }
          },
        }
      });
      const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
      validationServiceStore.setValidationService(mockValidationService);
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
        username: 'harry',
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
          username: 'hi',  // too short
          age: -1         // negative age
        });
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        if (err instanceof ReferenceError) {
          expect('Unexpected ReferenceError: ' + err.message).toBeFalsy();
        }
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('String must contain at least 3 character(s), Number must be greater than or equal to 0, Required');
      }
    });

    it('should not validate without @Valid', async () => {
      const hello = await app.getApplicationContext().getAsync(Hello);
      const result = await hello.testWithoutValid({
        username: 'hi',  // too short
        age: -1         // negative age
      });
      expect(result).toEqual({
        username: 'hi',
        age: -1
      });
    });

    it('should validate nested object with @Valid', async () => {
      const hello = await app.getApplicationContext().getAsync(Hello);
      const result = await hello.testNested({
        username: 'harry',
        age: 18,
        world: {
          age: 15
        }
      });
      expect(result).toEqual({
        username: 'harry',
        age: 18,
        world: {
          age: 15
        }
      });
    });

    it('should throw error when nested validation fails', async () => {
      const hello = await app.getApplicationContext().getAsync(Hello);
      try {
        await hello.testNested({
          username: 'harry',
          age: 18,
          world: {
            age: 25  // exceeds max value
          }
        });
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.message).toContain('Number must be less than or equal to 20');
      }
    });

    it('should use custom error status from @Validate', async () => {
      const hello = await app.getApplicationContext().getAsync(Hello);
      try {
        await hello.testWithCustomOptions({
          username: 'hi',  // too short
          age: -1         // negative age
        });
        expect('should not reach here').toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(MidwayValidationError);
        expect(err.status).toBe(400);  // custom error status
      }
    });
  });

  describe('validation middleware test', () => {
    let app;
    class UserDTO {
      @Rule(z.string().min(3))
      username: string;

      @Rule(z.number().int().min(0))
      age: number;
    }

    @Controller('/api')
    class UserController {
      @Post('/user')
      @Validate({
        errorStatus: 422
      })
      async createUser(@Body() user: UserDTO) {
        return user;
      }
    }

    @Catch(MidwayValidationError)
    class DefaultErrorHandler {
      async catch(err, context) {
        context.status = err.status;
        return {
          message: err.message,
        }
      }
    }

    beforeAll(async () => {
      app = await createLightApp({
        imports: [
          koa,
          validation
        ],
        preloadModules: [UserController, DefaultErrorHandler],
        globalConfig: {
          keys: '123',
          i18n: {
            defaultLocale: 'en_US',
            localeTable: {
              en_US: {
                validate: {
                  min: 'The minimum length is {0}.'
                }
              },
              zh_CN: {
                validate: {
                  min: '最小长度为 {0}.'
                }
              }
            }
          },
          validate: {
            errorStatus: 422
          }
        },
      });

      app.useFilter([DefaultErrorHandler]);

      const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
      validationServiceStore.setValidationService(mockValidationService);
    });

    afterAll(async () => {
      await close(app);
    });

    it('should validate request body successfully', async () => {
      const result = await createHttpRequest(app)
        .post('/api/user')
        .send({
          username: 'harry',
          age: 18
        });

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        username: 'harry',
        age: 18
      });
    });

    it('should return 422 for invalid request body', async () => {
      const result = await createHttpRequest(app)
        .post('/api/user')
        .send({
          username: 'hi',  // too short
          age: -1         // negative age
        });

      expect(result.status).toBe(422);
      expect(result.body).toHaveProperty('message');
      expect(result.body.message).toContain('String must contain at least 3 character(s)');
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
          validate: {
            throwValidateError: false,
          },
          i18n: {
            defaultLocale: 'en_US',
            localeTable: {
              en_US: {
                validate: {
                  min: 'The minimum length is {0}.'
                }
              },
              zh_CN: {
                validate: {
                  min: '最小长度为 {0}.'
                }
              }
            }
          },
        }
      });

      const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
      validationServiceStore.setValidationService(mockValidationService);

      class UserDTO {
        @Rule(z.number().max(10))
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
      });

      const validationServiceStore = await app.getApplicationContext().getAsync(validation.ValidationServiceStore);
      validationServiceStore.setValidationService(mockValidationService);

      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test(1)).toEqual(1);
      expect(await hello.test(-1)).toEqual(-1);
      let error;
      try {
        await hello.test(1.1);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("Expected integer, received float");

      try {
        await hello.test(null as any);
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("Expected number, received null");

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
      });

      const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
      validationServiceStore.setValidationService(mockValidationService);

      @Provide()
      class Hello {
        async test(@Valid(z.string().min(3).max(4)) @TestPipe(new DefaultValuePipe('bbb')) data?: string) {
          return data || '';
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

      expect(error.message).toMatch("String must contain at most 4 character(s)");
      await close(app);
    });

    it('should test @Valid with DTO schema', async () => {
      class UserDTO {
        @Rule(z.string())
        name?: string;

        @Rule(z.string())
        nickName?: string;
      }

      const app = await createLightApp({
        imports: [validation],
      });

      const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
      validationServiceStore.setValidationService(mockValidationService);

      @Provide()
      class Hello {
        async test(@Valid(z
          .object({
            name: z.string().optional(),
            nickName: z.string().optional(),
          })
          .refine((data) => data.name !== undefined || data.nickName !== undefined, {
            path: ["name", "nickName"],
            message: "至少需要一个字段 a 或 b",
          })) user: UserDTO) {
          return user;
        }
      }

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);

      expect(await hello.test({
        name: 'hello world',
      })).toEqual({
        name: 'hello world',
      });

      let error;
      try {
        await hello.test({});
      } catch (err) {
        error = err;
      }

      expect(error.message).toMatch("至少需要一个字段 a 或 b");
      await close(app);
    });
  });
});
