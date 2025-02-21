import { createLightApp, close } from '@midwayjs/mock';
import { ValidationService } from '@midwayjs/validation';
import * as validation from '@midwayjs/validation';
import { IsString, IsNumber, Min, Max } from 'class-validator';

import classValidator from '../src/index';

describe('test/index.test.ts', () => {
  describe('validation service test with class validator', () => {
    it('should validate class successfully', async () => {
      class UserDTO {
        @IsString()
        name: string;

        @IsNumber()
        @Min(0)
        @Max(100)
        age: number;
      }

      const app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              classValidator,
            },
          }
        }
      });

      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const result = await validationService.validate(UserDTO, {
        name: 'harry',
        age: 18
      });

      expect(result.status).toBeTruthy();
      expect(result.value.name).toEqual('harry');
      expect(result.value.age).toEqual(18);

      await close(app);
    });

    it('should throw error for invalid data', async () => {
      class UserDTO {
        @IsString()
        name: string;

        @IsNumber()
        @Min(0)
        @Max(100)
        age: number;
      }

      const app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              classValidator,
            },
          }
        }
      });

      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const result = await validationService.validate(UserDTO, {
        name: 123,  // should be string
        age: 'abc'  // should be number
      }, {
        locale: 'zh-CN',
        throwValidateError: false
      });

      expect(result.status).toBeFalsy();
      expect(result.message).toContain('name 必须是字符串');
      expect(result.messages).toEqual(['name 必须是字符串', 'age 不能大于 100, age 不能小于 0, age 必须是符合指定约束的数字']);
      await close(app);
    });
  });
});
