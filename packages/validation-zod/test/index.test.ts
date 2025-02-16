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

        @Rule(getSchema(WorldDTO).optional())
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
});
