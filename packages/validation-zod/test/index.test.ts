import {
  Validate,
  Rule,
  OmitDto,
  Valid,
  ValidationService,
  getSchema
} from '@midwayjs/validation';
import { createLightApp, close, createHttpRequest } from '@midwayjs/mock';
import { z } from 'zod';
import * as valid from '@midwayjs/validation';
import {
  Provide,
  Controller,
  Post,
  Body,
  Catch,
  IMidwayContainer,
  MidwayFrameworkService
} from '@midwayjs/core';
import * as assert from 'assert';
import * as koa from '@midwayjs/koa';
import { defineConfiguration } from '@midwayjs/core/functional';
import zod from '../src';

describe('test/index.test.ts', () => {
  describe('/test/check.test.ts', () => {
    it('check with check', async () => {
      const app = await createLightApp({
        imports: [valid],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          }
        }
      });

      class TO {}

      class UserDTO extends TO {
        @Rule(z.number().max(10))
        age: number;
      }

      class HelloDTO extends UserDTO {}

      @Provide()
      class Hello {
        school(a, @Valid() data: HelloDTO) {
          return data;
        }
      }
      const user = {
        age: 8,
      };

      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);
      const result = hello.school(1, user);
      assert.deepEqual(result, user);

      await close(app);
    });

    it('check with check with extends', async () => {
      const app = await createLightApp({
        imports: [valid],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          }
        }
      });
      class TO {}

      class UserDTO extends TO {
        @Rule(z.number().max(10))
        age: number;
      }

      class HelloDTO extends UserDTO {
        @Rule(z.number().min(4))
        age: number;
      }

      @Provide()
      class Hello {
        school(a, @Valid() data: HelloDTO) {
          return data;
        }
      }
      const user = {
        age: 11,
      };
      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);
      const result = hello.school(1, user);
      assert.deepEqual(result, user);

      await close(app);
    });

    it('check with check with options', async () => {
      const app = await createLightApp({
        imports: [valid],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          }
        }
      });
      class WorldDTO {
        @Rule(z.number().max(20))
        age: number;
      }

      class UserDTO {
        @Rule(z.number().max(10))
        age: number;

        @Rule(z.number().max(10).optional())
        world?: WorldDTO;
      }

      @Provide()
      class Hello {
        school(a, @Valid() data: UserDTO) {
          return data;
        }
      }
      const user = {
        age: 10,
      };
      app.getApplicationContext().bind(Hello);
      const hello = await app.getApplicationContext().getAsync(Hello);
      const result = hello.school(1, user);
      assert.deepEqual(result, user);

      await close(app);
    });

    it('check with check with array', async () => {
      const app = await createLightApp({
        imports: [valid],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          }
        }
      });

      class WorldDTO {
        @Rule(z.number().max(20))
        age: number;
      }

      class UserDTO {
        @Rule(z.number().max(10))
        age: number;

        @Rule(z.array(getSchema(WorldDTO)))
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
        world: [
          {
            age: 10,
          },
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
      expect(error.message).toMatch(
        /Number must be less than or equal to 20/
      );
      await close(app);
    });

    it('should test global validate config', async () => {
      const app = await createLightApp({
        imports: [valid],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          },
          zod: {
            strict: false,
            passthrough: true
          }
        }
      });

      class UserDTO {
        @Rule(z.number().max(10))
        age: number;

        @Rule(z.string().optional())
        name?: string;
      }

      @Provide()
      class Hello {
        @Validate({
          errorStatus: 400,
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
          age: 11,
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

    it('test cascade with extends check', async () => {
      class SchoolDTO {
        @Rule(z.string().min(1))
        name: string;
        @Rule(z.string().optional())
        address: string;
      }

      class NewSchoolDTO extends OmitDto(SchoolDTO, ['address']) {}

      class UserDTO {
        @Rule(() => z.array(getSchema(NewSchoolDTO)))
        schoolList: NewSchoolDTO[];
      }

      const app = await createLightApp({
        imports: [valid],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          }
        }
      });

      const validateService = app.getApplicationContext().get(ValidationService);

      const result = validateService.validate(UserDTO, {
        schoolList: [
          {
            address: 'abc',
          },
        ],
      }, {
        throwValidateError: false
      });
      expect(result.status).toBeFalsy();
      expect(result.message).toEqual('Validation error: Required at "schoolList[0].name"');
    });
  });

  describe('test/i18n.test.ts', function () {
    it('should test with locale in decorator options', async () => {
      @Catch()
      class CatchAll {
        catch(err, ctx) {
          return err.message;
        }
      }

      class UserDTO {
        @Rule(z.string().max(10))
        name: string;
      }

      @Controller('/user')
      class UserController {
        @Post('/')
        @Validate({
          locale: 'zh_CN',
        })
        async aspectWithValidate(@Body() bodyData: UserDTO) {
          return bodyData;
        }

        @Post('/global_options')
        async global_options(@Body() bodyData: UserDTO) {
          return bodyData;
        }
      }

      const configuration = defineConfiguration({
        async onReady(container: IMidwayContainer): Promise<void> {
          (await container.getAsync(MidwayFrameworkService)).getFramework('koa').useFilter(CatchAll);
        }
      });

      const app = await createLightApp({
        imports: [koa, valid, configuration],
        globalConfig: {
          keys: '12345',
          validation: {
            validators: {
              zod,
            },
          }
        },
        preloadModules: [
          UserController,
          CatchAll
        ]
      });

      const result = await createHttpRequest(app).post('/user/').send({
        name: 'abcdefghijklmn',
      });

      expect(result.text).toMatch(/Validation error: 文本长度不得多于 10 个字符 at \"name\"/);
      await close(app);
    });

    it('should test validate with schema', async () => {
      const app = await createLightApp({
        imports: [
          valid,
        ],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          }
        }
      });

      const validateService = await app.getApplicationContext().getAsync(ValidationService);
      const result = validateService.validateWithSchema(
        z.object({
          age: z.number(),
        }),
        {
          age: 11,
        }
      );
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({
        age: 11,
      });

      await close(app);
    });

    it('should test get schema', async () => {
      const app = await createLightApp({
        imports: [
          valid,
        ],
        globalConfig: {
          validation: {
            validators: {
              zod,
            },
          }
        }
      });

      const validateService = await app.getApplicationContext().getAsync(ValidationService);

      class UserDTO {
        @Rule(z.number())
        age: number;
      }

      const schema = validateService.getSchema(UserDTO);

      try {
        schema.parse({
          age: 11,
        });
      } catch (err) {
        expect(err).toBeDefined();
      }

      await close(app);
    });

    it('should return undefined when schema is null', function () {
      const validateService = new ValidationService();
      const result = validateService.validateWithSchema(null, {
        age: 11,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('test/schemaHelper', () => {
    class TestDTO {
      @Rule(z.string())
      name: string;

      @Rule(z.number().optional())
      age?: number;

      @Rule(z.string().optional())
      description?: string;
    }

    const { schemaHelper } = zod;

    it('should test basic schema helpers', () => {
      expect(schemaHelper.getIntSchema().safeParse(42).success).toBeTruthy();
      expect(schemaHelper.getIntSchema().safeParse(42.5).success).toBeFalsy();

      expect(schemaHelper.getBoolSchema().safeParse(true).success).toBeTruthy();
      expect(schemaHelper.getBoolSchema().safeParse('true').success).toBeFalsy();

      expect(schemaHelper.getFloatSchema().safeParse(42.5).success).toBeTruthy();
      expect(schemaHelper.getFloatSchema().safeParse('42.5').success).toBeFalsy();

      expect(schemaHelper.getStringSchema().safeParse('test').success).toBeTruthy();
      expect(schemaHelper.getStringSchema().safeParse(42).success).toBeFalsy();
    });

    it('should test isRequired and isOptional', () => {
      expect(schemaHelper.isRequired(TestDTO, 'name')).toBeTruthy();
      expect(schemaHelper.isRequired(TestDTO, 'age')).toBeFalsy();
      expect(schemaHelper.isOptional(TestDTO, 'age')).toBeTruthy();
      expect(schemaHelper.isOptional(TestDTO, 'name')).toBeFalsy();
    });

    it('should test setRequired for single property', () => {
      class RequiredTestDTO {
        @Rule(z.string())
        name: string;

        @Rule(z.number().optional())
        age?: number;
      }

      // 先验证初始状态
      const initialSchema = schemaHelper.getSchema(RequiredTestDTO);
      const initialResult = initialSchema.safeParse({
        name: 'test'  // age 是可选的，可以不提供
      });
      expect(initialResult.success).toBeTruthy();

      // 检查初始状态
      const initialIsOptional = schemaHelper.isOptional(RequiredTestDTO, 'age');
      expect(initialIsOptional).toBeTruthy();

      // 设置 age 为必需并验证状态
      schemaHelper.setRequired(RequiredTestDTO, 'age');
      const afterSetRequired = schemaHelper.isRequired(RequiredTestDTO, 'age');
      expect(afterSetRequired).toBeTruthy();

      const schema = schemaHelper.getSchema(RequiredTestDTO);
      const result = schema.safeParse({
        name: 'test'  // 现在缺少必需的 age
      });
      expect(result.success).toBeFalsy();

      // 验证提供所有字段时能通过
      const fullResult = schema.safeParse({
        name: 'test',
        age: 18
      });
      expect(fullResult.success).toBeTruthy();
    });

    it('should test setOptional for single property', () => {
      class SingleDTO {
        @Rule(z.string())
        name: string;

        @Rule(z.number())
        age: number;
      }

      // 先验证初始状态
      const initialSchema = schemaHelper.getSchema(SingleDTO);
      const initialResult = initialSchema.safeParse({
        age: 18  // 不提供 name
      });
      expect(initialResult.success).toBeFalsy();

      // 设置为可选并验证状态
      schemaHelper.setOptional(SingleDTO, 'name');
      expect(schemaHelper.isOptional(SingleDTO, 'name')).toBeTruthy();

      const schema = schemaHelper.getSchema(SingleDTO);
      const result = schema.safeParse({
        age: 18  // 不提供 name
      });

      // 验证一个完整的对象也能通过
      const fullResult = schema.safeParse({
        name: 'test',
        age: 18
      });
      expect(fullResult.success).toBeTruthy();

      // 验证只提供可选字段也能通过
      const optionalOnlyResult = schema.safeParse({
        name: 'test'  // 只提供可选字段
      }).success;
      expect(optionalOnlyResult).toBeFalsy(); // age 仍然是必需的

      expect(result.success).toBeTruthy();
    });

    it('should test setOptional with nested schema', () => {
      class NestedDTO {
        @Rule(z.object({
          firstName: z.string(),
          lastName: z.string()
        }))
        name: {
          firstName: string;
          lastName: string;
        };

        @Rule(z.number())
        age: number;
      }

      schemaHelper.setOptional(NestedDTO, 'name');
      const schema = schemaHelper.getSchema(NestedDTO);

      expect(schema.safeParse({
        age: 18
      }).success).toBeTruthy();
    });

    it('should test setRequired for all properties', () => {
      schemaHelper.setRequired(TestDTO);

      expect(schemaHelper.isRequired(TestDTO, 'name')).toBeTruthy();
      expect(schemaHelper.isRequired(TestDTO, 'age')).toBeTruthy();
      expect(schemaHelper.isRequired(TestDTO, 'description')).toBeTruthy();

      const schema = schemaHelper.getSchema(TestDTO);
      expect(schema.safeParse({
        name: 'test',
        age: 18
        // 缺少 description
      }).success).toBeFalsy();
    });

    it('should test setOptional for all properties', () => {
      schemaHelper.setOptional(TestDTO);

      expect(schemaHelper.isOptional(TestDTO, 'name')).toBeTruthy();
      expect(schemaHelper.isOptional(TestDTO, 'age')).toBeTruthy();
      expect(schemaHelper.isOptional(TestDTO, 'description')).toBeTruthy();

      const schema = schemaHelper.getSchema(TestDTO);
      expect(schema.safeParse({}).success).toBeTruthy();
    });

    it('should test getSchema with complex validations', () => {
      class RangeDTO {
        @Rule(z.number().min(1).max(10))
        value: number;

        @Rule(z.array(z.string()).min(1).max(3))
        tags: string[];
      }

      const schema = schemaHelper.getSchema(RangeDTO);

      // 测试有效数据
      expect(schema.safeParse({
        value: 5,
        tags: ['a', 'b']
      }).success).toBeTruthy();

      // 测试数值范围
      expect(schema.safeParse({
        value: 0,
        tags: ['a']
      }).success).toBeFalsy();

      expect(schema.safeParse({
        value: 11,
        tags: ['a']
      }).success).toBeFalsy();

      // 测试数组长度
      expect(schema.safeParse({
        value: 5,
        tags: []
      }).success).toBeFalsy();

      expect(schema.safeParse({
        value: 5,
        tags: ['a', 'b', 'c', 'd']
      }).success).toBeFalsy();
    });

    it('should maintain other validations after changing required/optional', () => {
      class RangeDTO {
        @Rule(z.number().min(1).max(10))
        value: number;
      }

      schemaHelper.setOptional(RangeDTO);
      const schema1 = schemaHelper.getSchema(RangeDTO);

      // 虽然是可选的，但如果提供了值，仍然要符合范围要求
      expect(schema1.safeParse({
        value: 20  // 超出最大值
      }).success).toBeFalsy();

      schemaHelper.setRequired(RangeDTO);
      const schema2 = schemaHelper.getSchema(RangeDTO);

      expect(schema2.safeParse({
        value: 0   // 小于最小值
      }).success).toBeFalsy();
    });
  });
});
