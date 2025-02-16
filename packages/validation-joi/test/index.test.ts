import {
  Validate,
  Rule,
  OmitDto,
  Valid,
  RULES_KEY,
  PickDto,
  ValidationService,
  getSchema,
} from '@midwayjs/validation';
import { createLightApp, close, createHttpRequest } from '@midwayjs/mock';
import * as Joi from 'joi';
import * as valid from '../src';
import {
  Provide,
  MetadataManager,
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

describe('test/index.test.ts', () => {
  describe('/test/check.test.ts', () => {
    it('check with check', async () => {
      const app = await createLightApp({
        imports: [valid],
      });

      class TO {}

      class UserDTO extends TO {
        @Rule(Joi.number().max(10))
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
      });
      class TO {}

      class UserDTO extends TO {
        @Rule(Joi.number().max(10))
        age: number;
      }

      class HelloDTO extends UserDTO {
        @Rule(Joi.number().min(4))
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
      });
      class WorldDTO {
        @Rule(Joi.number().max(20))
        age: number;
      }

      class UserDTO {
        @Rule(Joi.number().max(10))
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
      });

      class WorldDTO {
        @Rule(Joi.number().max(20))
        age: number;
      }

      class UserDTO {
        @Rule(Joi.number().max(10))
        age: number;

        @Rule(Joi.array().items(getSchema(WorldDTO)))
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
        /"world\[1\].age" must be less than or equal to 20/
      );
      await close(app);
    });

    it.skip('check with check and transform object', async () => {
      const app = await createLightApp({
        imports: [valid],
      });
      class UserDTO {
        @Rule(Joi.number().max(10))
        age: number;

        @Rule(Joi.string().required())
        firstName: string;

        @Rule(Joi.string().max(10))
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
      const app = await createLightApp({
        imports: [valid],
      });
      class UserDTO {
        @Rule(Joi.number().max(10))
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
      const app = await createLightApp({
        imports: [valid],
      });
      class WorldDTO {
        @Rule(Joi.number().max(20))
        age: number;
      }

      class UserDTO {
        @Rule(Joi.number().max(10))
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
      const app = await createLightApp({
        imports: [valid],
      });
      class WorldDTO {
        @Rule(Joi.number().max(20))
        age: number;
      }

      class UserDTO {
        @Rule(Joi.number().max(10))
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
      expect(error.message).toMatch(
        /"world.age" must be less than or equal to 20/
      );

      await close(app);
    });

    it('check with check when two level and array and not equal', async () => {
      const app = await createLightApp({
        imports: [valid],
      });
      class WorldDTO {
        @Rule(Joi.number().max(20))
        age: number;
      }

      class UserDTO {
        @Rule(Joi.number().max(10))
        age: number;

        @Rule(Joi.array().items(getSchema(WorldDTO)))
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
      expect(error.message).toMatch(
        /"worlds\[0\].age" must be less than or equal to 20/
      );

      await close(app);
    });

    it.skip('should transform string to number', async () => {
      const app = await createLightApp({
        imports: [valid],
      });
      class UserNewDTO {
        @Rule(Joi.number().required())
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
        id: '555',
      } as any);
      expect(typeof data.id).toEqual('number');

      await close(app);
    });

    it('should test Joi transform type', function () {
      const schema = Joi.object({
        age: Joi.number(),
      });
      const result = schema.validate({
        age: '12',
      });
      expect(typeof result.value.age).toEqual('number');
    });

    it('should test global validate config', async () => {
      const app = await createLightApp({
        imports: [valid],
      });

      class UserDTO {
        @Rule(Joi.number().max(10))
        age: number;
      }

      @Provide()
      class Hello {
        @Validate({
          validatorOptions: {
            allowUnknown: true,
          },
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

    it('test cascade with extends check', () => {
      class SchoolDTO {
        @Rule(Joi.string().required())
        name: string;
        @Rule(Joi.string())
        address: string;
      }

      class NewSchoolDTO extends OmitDto(SchoolDTO, ['address']) {}

      class UserDTO {
        @Rule(Joi.array().items(getSchema(NewSchoolDTO)))
        schoolList: NewSchoolDTO[];
      }

      const schema = getSchema(UserDTO);
      const result = schema.validate({
        schoolList: [
          {
            address: 'abc',
          },
        ],
      });
      console.log(result);
    });

    it.skip('should support extends schema for class and property', async () => {
      class UserDTO {
        @Rule(Joi.string())
        name?: string;
        @Rule(Joi.string())
        nickName?: string;
      }

      class Child extends UserDTO {}

      // @Rule(getSchema(SubChild).and('name', 'nickName'))
      // class SubChild extends Child {}

      const app = await createLightApp({
        imports: [valid],
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
      expect(rule.validate({ name: 'abc' }).value).toEqual({ name: 'abc' });
      expect(rule.validate({}).error.message).toMatch(
        'contain at least one of [name, nickName]'
      );

      expect(getSchema(Child)).toBeDefined();
      const schema = getSchema(Child);
      expect(schema.validate({ name: 'abc' }).value).toEqual({ name: 'abc' });
      expect(getSchema(Child).validate({}).error.message).toMatch(
        'contain at least one of [name, nickName]'
      );

      // console.log(getSchema(SubChild));

      await close(app);
    });
  });

  describe('/test/util/dtoHelper.test.ts', () => {
    class BaseDto {
      hello(): string {
        return 'hello midway';
      }

      @Rule(Joi.number().integer())
      baseAttr: number;
    }

    class TestDto extends BaseDto {
      @Rule(Joi.date())
      createTime: Date;

      @Rule(Joi.string().max(64).description('产品名称').required())
      productName: string;

      @Rule(Joi.number().description('价格').required())
      price: number;

      @Rule(Joi.number().integer())
      quantity: number;

      addPrice(p: number): number {
        this.price += p;
        return this.price;
      }
    }

    it('should test dto extend', async () => {
      class ChildDto extends TestDto {
        @Rule(Joi.number().integer())
        id: number;

        @Rule(Joi.string())
        quantity: number;

        @Rule(Joi.string())
        comment: string;
      }
      const rules = MetadataManager.getPropertiesWithMetadata(
        RULES_KEY,
        ChildDto
      );
      const ruleKeys = Object.keys(rules);
      expect(ruleKeys.length).toBe(7);
      expect(ruleKeys.includes('id')).toBeTruthy();
      expect(ruleKeys.includes('price')).toBeTruthy();
      expect(ruleKeys.includes('quantity')).toBeTruthy();
      expect(ruleKeys.includes('baseAttr')).toBeTruthy();
      expect(rules.quantity.type).toEqual('string');
    });

    it('should test PickDto', async () => {
      class PickedDto extends PickDto(TestDto, ['createTime', 'price']) {}
      const rules = MetadataManager.getPropertiesWithMetadata(
        RULES_KEY,
        PickedDto
      );
      const ruleKeys = Object.keys(rules);
      expect(ruleKeys.length).toBe(2);
      expect(ruleKeys.includes('quantity')).toBeFalsy();
      expect(ruleKeys.includes('createTime')).toBeTruthy();
    });

    it('should test OmitDto', async () => {
      class OmittedDto extends OmitDto(TestDto, ['productName']) {}
      const rules = MetadataManager.getPropertiesWithMetadata(
        RULES_KEY,
        OmittedDto
      );
      const ruleKeys = Object.keys(rules);
      expect(ruleKeys.length).toBe(4);
      expect(ruleKeys.includes('productName')).toBeFalsy();
      expect(ruleKeys.includes('quantity')).toBeTruthy();
    });

    it('should test method extend', async () => {
      class PickedDto extends PickDto(TestDto, [
        'price',
        'addPrice',
        'hello',
      ]) {}
      class OmittedDto extends OmitDto(TestDto, ['productName']) {}
      const pInst = new PickedDto();
      pInst.price = 10;
      expect(pInst.hello()).toEqual('hello midway');
      expect(pInst.addPrice(20)).toEqual(30);

      const oInst = new OmittedDto();
      oInst.price = 100;
      expect(oInst.hello()).toEqual('hello midway');
      expect(oInst.addPrice(-20)).toEqual(80);

      expect(pInst instanceof BaseDto).toBeTruthy();
      expect(oInst instanceof BaseDto).toBeTruthy();
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
        @Rule(Joi.string().max(10))
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
        @Validate()
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
          i18n: {
            defaultLocale: 'zh_CN'
          },
        },
        preloadModules: [
          UserController,
          CatchAll
        ]
      });

      const result = await createHttpRequest(app).post('/user/').send({
        name: 'abcdefghijklmn',
      });

      expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
      await close(app);
    });

    it('should test with locale global options', async () => {
      @Catch()
      class CatchAll {
        catch(err, ctx) {
          return err.message;
        }
      }
      class UserDTO {
        @Rule(Joi.string().max(10))
        name: string;
      }

      @Controller('/user')
      class UserController {
        @Post('/global_options')
        @Validate()
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
        preloadModules: [
          UserController,
          CatchAll
        ],
        globalConfig: {
          keys: '12345',
          i18n: {
            defaultLocale: 'zh_CN'
          },
        },
      });
      const result = await createHttpRequest(app)
        .post('/user/global_options')
        .send({
          name: 'abcdefghijklmn',
        });

      expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
      await close(app);
    });

    it('should test with query locale', async () => {
      @Catch()
      class CatchAll {
        catch(err, ctx) {
          return err.message;
        }
      }

      class UserDTO {
        @Rule(Joi.string().max(10))
        name: string;
      }

      @Controller('/user')
      class UserController {
        @Post('/')
        @Validate()
        async aspectWithValidate(@Body() bodyData: UserDTO) {
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
          i18n: {
            defaultLocale: 'en_US'
          },
        },
        preloadModules: [
          UserController,
          CatchAll
        ],
      });
      const result = await createHttpRequest(app)
        .post('/user/')
        .query({
          locale: 'zh_CN',
        })
        .send({
          name: 'abcdefghijklmn',
        });

      expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
      await close(app);
    });

    it('should test with locale fallback', async () => {

      @Catch()
      class CatchAll {
        catch(err, ctx) {
          return err.message;
        }
      }

      class UserDTO {
        @Rule(Joi.string().max(10))
        name: string;
      }

      @Controller('/user')
      class UserController {
        @Post('/')
        @Validate({
          locale: 'tr_TR',
        })
        async aspectWithValidate(@Body() bodyData: UserDTO) {
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
        preloadModules: [
          UserController,
          CatchAll
        ],
        globalConfig: {
          keys: '12345',
          i18n: {
            defaultLocale: 'zh_CN'
          },
        },
      });

      const result = await createHttpRequest(app).post('/user/').send({
        name: 'abcdefghijklmn',
      });

      expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
      await close(app);
    });

    it('should test with locale fallback use custom message', async () => {
      @Catch()
      class CatchAll {
        catch(err, ctx) {
          return err.message;
        }
      }

      class UserDTO {
        @Rule(Joi.string().max(10))
        name: string;
      }

      @Controller('/user')
      class UserController {
        @Post('/')
        @Validate()
        async aspectWithValidate(@Body() bodyData: UserDTO) {
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
        preloadModules: [
          UserController,
          CatchAll
        ],
        globalConfig:  {
          keys: '12345',
          i18n: {
            defaultLocale: 'zh_CN',
            localeTable: {
              zh_CN: {
                validate: {
                  'string.max': 'hello world',
                },
              },
            },
          },
        },
      });

      const result = await createHttpRequest(app).post('/user/').send({
        name: 'abcdefghijklmn',
      });

      expect(result.text).toEqual('hello world');
      await close(app);
    });

    it('should test invoke Joi with message and language', function () {
      const result = Joi
        .string()
        .max(10)
        .validate('abcdefghijklmn', {
          messages: {
            zh_CN: {
              'string.max': '{{#label}} 长度必须小于或等于 {{#limit}} 个字符长',
            },
          },
          errors: {
            language: 'zh_CN',
          },
        });

      expect(result.error.message).toEqual(
        '"value" 长度必须小于或等于 10 个字符长'
      );
    });
  });

  describe('validate.test.ts', function () {
    it('should test Joi with message', async () => {
      class UserDTO {
        @Rule(
          Joi.number()
            .max(10)
            .message('{{#label}} data max over 10')
            .error(errors => {
              errors.forEach(err => {
                switch (err.code) {
                  case 'any.empty':
                    err.message = 'Value should not be empty!';
                    break;
                  case 'number.min':
                    err.message = `Value should have at least ${err} characters!`;
                    break;
                  case 'number.max':
                    err.message = `Value should have at most ${err.code} characters!`;
                    break;
                  default:
                    break;
                }
              });
              return errors as unknown as Joi.ValidationErrorItem;
            })
        )
        age: number;
      }

      const app = await createLightApp({
        imports: [
          valid,
        ],
      });

      const validateService = await app.getApplicationContext().getAsync(ValidationService);
      try {
        validateService.validate(UserDTO, {
          age: 11,
        });
      } catch (err) {
        expect(err.message).toMatch(
          'Value should have at most number.max characters'
        );
      }

      await close(app);
    });

    it('should test validate with schema', async () => {
      const app = await createLightApp({
        imports: [
          valid,
        ],
      });

      const validateService = await app.getApplicationContext().getAsync(ValidationService);
      const result = validateService.validateWithSchema(
        Joi.object().keys({
          age: Joi.number(),
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
      });

      const validateService = await app.getApplicationContext().getAsync(ValidationService);

      class UserDTO {
        @Rule(Joi.number())
        age: number;
      }

      const schema = validateService.getSchema(UserDTO);

      try {
        schema.validate({
          age: 11,
        });
      } catch (err) {
        expect(err).toBeDefined();
      }

      await close(app);
    });

    it('should not merge default config with args', async () => {
      class UserDTO {
        @Rule(Joi.number())
        age: number;
      }

      const app = await createLightApp({
        imports: [
          valid,
        ],
        globalConfig: {
          joi: {
            allowUnknown: true,
          }
        }
      });

      const validateService = await app.getApplicationContext().getAsync(ValidationService);
      validateService.validate(
        UserDTO,
        {
          age: 11,
        },
        {},
        {
          allowUnknown: false,
        }
      );

      expect(
        (validateService['validateConfig'] as any).validateOptions
          .allowUnknown
      ).toBe(true);

      validateService.validateWithSchema(
        getSchema(UserDTO),
        {
          age: 11,
        },
        {},
        {
          allowUnknown: false,
        }
      );

      expect(
        (validateService['validateConfig'] as any).validateOptions
          .allowUnknown
      ).toBe(true);
    });

    it('should return undefined when schema is null', function () {
      const validateService = new ValidationService();
      const result = validateService.validateWithSchema(null, {
        age: 11,
      });
      expect(result).toBeUndefined();
    });
  });
});
